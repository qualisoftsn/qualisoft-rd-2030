/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/app/dashboard/reclamations/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react'; 
import apiClient from '@/core/api/api-client';
import Sidebar from '@/app/dashboard/sidebar'; 
import { Eye, X, Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- TYPES ---
interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Status: string;
  REC_Processus?: { PR_Libelle: string };
  REC_Tier?: { TR_Name: string };
  REC_Description: string;
  REC_SolutionProposed?: string;
  REC_Deadline?: string;
}

export default function ReclamationsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isSuperAdmin = user?.U_Role === 'SUPER_ADMIN';

  const [recs, setRecs] = useState<Reclamation[]>([]);
  const [dataSources, setDataSources] = useState({ processus: [], tiers: [] });
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRec, resProcs, resTiers] = await Promise.all([
        apiClient.get('/reclamations'),
        apiClient.get('/processus'),
        apiClient.get('/tiers')
      ]);
      setRecs(resRec.data?.data || []);
      setDataSources({
        processus: resProcs.data?.data || resProcs.data || [],
        tiers: resTiers.data?.data || resTiers.data || []
      });
    } catch (err) {
      toast.error("Erreur de synchronisation");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRecs = useMemo(() => 
    recs.filter(r => r.REC_Object.toLowerCase().includes(searchTerm.toLowerCase()) || r.REC_Reference.toLowerCase().includes(searchTerm.toLowerCase())),
    [recs, searchTerm]
  );

  const handleUpdate = async () => {
    if (!selectedRec) return;
    try {
      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, selectedRec);
      toast.success("Mise à jour réussie");
      setIsEditing(false); fetchData(); setSelectedRec(null);
    } catch (e) { toast.error("Échec de la sauvegarde"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic animate-pulse">CHARGEMENT...</div>;

  return (
    <div className="flex min-h-screen bg-[#0B0F1A]">
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
      
      <main className="flex-1 ml-72 p-10 text-white italic overflow-y-auto h-screen">
        <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Pilotage <span className="text-blue-500">Réclamations</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Management ISO 10002</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input placeholder="RECHERCHER..." className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase outline-none focus:border-blue-500 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black text-[10px] flex items-center gap-3 uppercase">
              <Plus size={18}/> Déclarer
            </button>
          </div>
        </header>

        <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 italic tracking-widest">
              <tr><th className="p-8">Objet</th><th className="p-8">Processus</th><th className="p-8 text-center">Statut</th><th className="p-8 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic font-bold text-[11px] uppercase">
              {filteredRecs.map(r => (
                <tr key={r.REC_Id} className="hover:bg-white/5 transition-colors">
                  <td className="p-8">
                    <p className="text-xs font-black">{r.REC_Object}</p>
                    <p className="text-[9px] text-slate-500 mt-1">{r.REC_Reference}</p>
                  </td>
                  <td className="p-8 text-blue-500">{r.REC_Processus?.PR_Libelle || "SMI"}</td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black border ${r.REC_Status === 'TRAITEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                      {r.REC_Status.replace('_', ' ')}
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

        {isCreateModalOpen && (
          <CreateModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onRefresh={fetchData} 
            tiers={dataSources.tiers} 
            processus={dataSources.processus} 
          />
        )}

        {selectedRec && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-110 flex justify-end">
            <div className="h-screen w-180 bg-[#0F172A] border-l border-white/10 p-12 flex flex-col shadow-4xl animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <h2 className="text-3xl font-black uppercase italic">Détails <span className="text-blue-500">Dossier</span></h2>
                <button onClick={() => { setSelectedRec(null); setIsEditing(false); }} className="p-4 bg-white/5 rounded-2xl hover:text-red-500"><X size={24}/></button>
              </div>
              
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 italic">
                 <DetailField label="Objet" value={selectedRec.REC_Object} isEditing={isEditing} onChange={(v: any) => setSelectedRec({...selectedRec, REC_Object: v})} />
                 <DetailField label="Description" value={selectedRec.REC_Description} isEditing={isEditing} isTextArea onChange={(v: any) => setSelectedRec({...selectedRec, REC_Description: v})} />
                 <DetailField label="Analyse & Solution" value={selectedRec.REC_SolutionProposed || ""} isEditing={isEditing} isTextArea onChange={(v: any) => setSelectedRec({...selectedRec, REC_SolutionProposed: v})} />
                 
                 <div className="mt-10">
                    {isEditing ? (
                      <button onClick={handleUpdate} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase text-xs">SAUVEGARDER</button>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="w-full py-6 bg-white/5 hover:bg-white/10 text-white rounded-4xl font-black uppercase text-xs">MODIFIER</button>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function DetailField({ label, value, isEditing, onChange, isTextArea }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-4xl border border-white/10">
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      {isTextArea ? (
        <textarea readOnly={!isEditing} className="w-full bg-transparent text-xs font-bold text-white outline-none mt-2 h-32" value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input readOnly={!isEditing} className="w-full bg-transparent text-sm font-black text-white outline-none mt-2" value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
    const [form, setForm] = useState({ REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '', REC_Deadline: '' });
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
          // ✅ La conversion Date est gérée proprement par le DTO
          await apiClient.post('/reclamations', { 
            ...form, 
            REC_Object: form.REC_Object.toUpperCase(),
            REC_Deadline: form.REC_Deadline || null 
          });
          onRefresh(); onClose(); toast.success("ENREGISTRÉ");
        } catch (err) { toast.error("DONNÉES INVALIDES"); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-200 flex items-center justify-center p-6 italic">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-lg rounded-[3rem] border border-white/10 p-10 space-y-6">
                <h2 className="text-3xl font-black text-white uppercase">Nouvelle <span className="text-blue-500">Réclamation</span></h2>
                <input required placeholder="OBJET" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-white outline-none" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                    <select required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black text-white outline-none uppercase" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                        <option value="">CLIENT / TIERS</option>
                        {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                    </select>
                    <select required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black text-white outline-none uppercase" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}>
                        <option value="">PROCESSUS</option>
                        {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                    </select>
                </div>

                <textarea required placeholder="DESCRIPTION DÉTAILLÉE" rows={3} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-white outline-none" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <label className="text-[8px] font-black text-slate-500 uppercase">Échéance souhaitée</label>
                   <input type="date" className="w-full bg-transparent text-white outline-none mt-1 text-xs" value={form.REC_Deadline} onChange={e => setForm({...form, REC_Deadline: e.target.value})} />
                </div>

                <button type="submit" disabled={saving} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase text-xs flex justify-center">
                    {saving ? <Loader2 className="animate-spin" /> : "VALIDER"}
                </button>
                <button type="button" onClick={onClose} className="w-full text-slate-500 text-[10px] font-black uppercase">Annuler</button>
            </form>
        </div>
    );
}