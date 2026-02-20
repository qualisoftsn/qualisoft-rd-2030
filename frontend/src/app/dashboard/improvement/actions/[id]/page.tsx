/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Clock, User, Calendar, 
  Paperclip, CheckCircle2, MessageSquare, 
  Edit3, Save, Trash2, ExternalLink, FileText,
  Target, Loader2, X, ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Cette page offre une immersion profonde dans une action spécifique. 
 * Elle gère le cycle de vie de la conformité : description, gestion des tâches granulaires, 
 * archivage des preuves (§7.5.3 ISO 9001) et suivi de l'avancement.
 * 
 * 🔍 PAGE : DOSSIER DÉTAILLÉ D'ACTION CORRECTIVE
 * Version 2.2 - Logic d'audit et gestion des preuves physiques.
 */
export default function ActionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [action, setAction] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'evidence' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  /**
   * 📡 CHARGEMENT CONSOLIDÉ DU DOSSIER
   * Agrège les tâches, les preuves et le contexte processus.
   */
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [actionRes, tasksRes, evidRes, procRes] = await Promise.all([
        apiClient.get(`/actions/${id}`),
        apiClient.get(`/actions/${id}/tasks`),
        apiClient.get(`/actions/${id}/evidences`),
        apiClient.get('/processes')
      ]);
      setAction(actionRes.data);
      setEditData(actionRes.data);
      setTasks(tasksRes.data);
      setEvidences(evidRes.data);
      setProcesses(procRes.data);
    } catch (err) {
      toast.error("Échec de récupération du dossier d'action.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdate = async () => {
    if (!id) return;
    const tid = toast.loading("Mise à jour du registre...");
    try {
      await apiClient.patch(`/actions/${id}`, editData);
      setAction(editData);
      setIsEditing(false);
      toast.success("Action scellée avec succès", { id: tid });
    } catch (err) {
      toast.error("Échec de la mise à jour", { id: tid });
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("VOULEZ-VOUS SUPPRIMER DÉFINITIVEMENT CETTE ACTION ? (IRRÉVERSIBLE)")) return;
    try {
      await apiClient.delete(`/actions/${id}`);
      toast.success("Action purgée du registre");
      router.push('/dashboard/improvement?tab=actions');
    } catch (err) {
      toast.error("Erreur de suppression système");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] ml-72 flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-black uppercase flex items-center gap-3 italic tracking-[0.3em]">
        <Loader2 className="animate-spin" /> Synchronisation du dossier...
      </div>
    </div>
  );

  const currentProcess = processes.find((p: any) => p.PR_Id === action.ACT_ProcessusId);
  const isDelayed = action.ACT_Deadline && new Date(action.ACT_Deadline) < new Date() && 
    action.ACT_Status !== 'TERMINEE' && action.ACT_Status !== 'ANNULEE';

  const statusColors: any = {
    'A_FAIRE': 'bg-slate-800 text-slate-400 border-white/5',
    'EN_COURS': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'TERMINEE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'ANNULEE': 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 selection:bg-blue-600/30">
      
      {/* 🛠️ HEADER : CONTRÔLE DE DOSSIER */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-10 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button 
            onClick={() => router.push('/dashboard/improvement?tab=actions')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border-none bg-transparent cursor-pointer italic"
          >
            <ArrowLeft size={16} /> Retour au registre
          </button>
          
          <div className="flex gap-4">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all border-none shadow-lg cursor-pointer italic"
                >
                  <Edit3 size={14} /> Modifier
                </button>
                <button 
                  onClick={handleDelete}
                  className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all border border-red-500/20 shadow-lg cursor-pointer italic"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {setIsEditing(false); setEditData(action);}}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all border-none cursor-pointer italic"
                >
                  <X size={14} /> Annuler
                </button>
                <button 
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-3xl shadow-blue-900/40 border-none cursor-pointer italic"
                >
                  <Save size={14} /> Enregistrer
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLONNE GAUCHE : DÉTAILS ET INTERACTION */}
          <div className="lg:col-span-8 space-y-8 text-left">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border italic tracking-widest leading-none ${statusColors[action.ACT_Status]}`}>
                  {action.ACT_Status?.replace('_', ' ')}
                </span>
                
                {currentProcess && (
                  <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 italic tracking-widest shadow-lg">
                    <Target size={12} /> {currentProcess.PR_Code}
                  </span>
                )}
                
                <span className="bg-slate-800 text-slate-400 border border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest">
                  {action.ACT_Origin?.replace('_', ' ')}
                </span>

                {isDelayed && (
                  <span className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase animate-pulse flex items-center gap-2 italic tracking-widest shadow-lg">
                    <Clock size={12} /> RETARD CRITIQUE
                  </span>
                )}
              </div>

              {isEditing ? (
                <input 
                  type="text"
                  value={editData.ACT_Title}
                  onChange={(e) => setEditData({...editData, ACT_Title: e.target.value})}
                  className="w-full bg-slate-950 border border-blue-500/30 rounded-4xl p-8 text-3xl font-black uppercase italic text-white outline-none focus:border-blue-500 mb-6 shadow-inner"
                />
              ) : (
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none text-white">
                  {action.ACT_Title}
                </h1>
              )}

              {isEditing ? (
                <textarea 
                  value={editData.ACT_Description || ''}
                  onChange={(e) => setEditData({...editData, ACT_Description: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-4xl p-8 text-sm font-bold text-slate-300 outline-none focus:border-blue-500 min-h-37.5 italic shadow-inner uppercase leading-relaxed"
                  placeholder="DÉTAILLER L'ACTION ICI..."
                />
              ) : (
                <p className="text-slate-400 text-sm font-bold leading-relaxed italic uppercase bg-slate-900/20 p-8 rounded-4xl border border-white/5">
                  {action.ACT_Description || "Aucune description détaillée n'a été indexée pour cette action."}
                </p>
              )}
            </div>

            {/* SYSTÈME D'ONGLETS DU DOSSIER */}
            <div className="flex gap-2 border-b border-white/5 pb-1 mt-12 overflow-x-auto scrollbar-hide">
              {[
                { id: 'details', label: 'Spécifications', icon: FileText },
                { id: 'tasks', label: `Décomposition (${tasks.length})`, icon: CheckCircle2 },
                { id: 'evidence', label: `Preuves (${evidences.length})`, icon: Paperclip },
                { id: 'history', label: 'Chronologie', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-t-4xl text-[10px] font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer italic ${
                    activeTab === tab.id 
                      ? 'bg-slate-900/60 text-blue-400 border-t border-l border-r border-white/10 shadow-2xl backdrop-blur-md' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-10 rounded-tl-none min-h-100 shadow-2xl backdrop-blur-md">
              {activeTab === 'tasks' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Décomposition Opérationnelle</h3>
                    <button className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border border-blue-500/20 cursor-pointer italic tracking-widest">
                      + Programmer une tâche
                    </button>
                  </div>
                  {tasks.length === 0 ? (
                    <div className="py-20 text-center bg-slate-950/20 rounded-[2.5rem] border border-dashed border-white/10">
                      <CheckCircle2 className="mx-auto text-slate-800 mb-6 opacity-20" size={48} />
                      <p className="text-slate-600 font-black uppercase italic text-xs tracking-[0.3em]">Aucune sous-tâche programmée pour cette action.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group shadow-lg">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                            task.itemStatus === 'TERMINE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' : 'bg-slate-800 text-slate-600 border-white/5'
                          }`}>
                            <CheckCircle2 size={24} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-black uppercase italic text-white group-hover:text-blue-400 transition-colors leading-none mb-2">{task.itemTitre}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-widest">
                              RESP: {task.responsable?.U_FirstName} {task.responsable?.U_LastName} • STATUT: {task.itemStatus}
                            </p>
                          </div>
                          <ArrowRight size={18} className="text-slate-800 group-hover:text-blue-500 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'evidence' && (
                <EvidenceManager evidences={evidences} actionId={id} onUpdate={setEvidences} />
              )}

              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-6 text-left">Configuration SMI</h3>
                  
                  {isEditing ? (
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-4xl p-8 text-left">
                      <label className="text-[11px] font-black uppercase text-blue-400 tracking-[0.3em] mb-4 block italic">Rattachement Processus *</label>
                      <select 
                        className="w-full bg-slate-950 border border-blue-500/30 rounded-2xl p-6 text-sm font-black uppercase italic outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
                        value={editData.ACT_ProcessusId}
                        onChange={e => setEditData({...editData, ACT_ProcessusId: e.target.value})}
                      >
                        {processes.map((proc: any) => (
                          <option key={proc.PR_Id} value={proc.PR_Id} className="bg-[#0B0F1A]">
                            {proc.PR_Code} - {proc.PR_Libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <InfoField 
                      label="Axe Processus Concerné" 
                      value={currentProcess?.PR_Libelle || 'NON DÉFINI'} 
                      color="text-blue-500"
                    />
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoField label="Niveau de Priorité" value={action.ACT_Priority} color={
                      action.ACT_Priority === 'URGENT' ? 'text-red-500' : 
                      action.ACT_Priority === 'HIGH' ? 'text-orange-500' : 'text-slate-100'
                    } />
                    <InfoField label="Échéance Maximale" value={action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'INDÉTERMINÉE'} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoField 
                      label="Responsable Indexé" 
                      value={`${action.ACT_Responsable?.U_FirstName || ''} ${action.ACT_Responsable?.U_LastName || ''}`} 
                    />
                    <InfoField label="Saisie Système" value={new Date(action.ACT_CreatedAt).toLocaleDateString()} />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-6 text-left">Log d&apos;Audit</h3>
                  <div className="p-8 bg-slate-950/40 rounded-4xl border-l-4 border-blue-600 text-left">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest italic leading-none">Scellage initial</p>
                    <p className="text-sm text-slate-300 font-bold uppercase italic tracking-tight leading-relaxed">Action créée et indexée dans le système d&apos;amélioration continue.</p>
                    <div className="flex items-center gap-2 mt-4 text-slate-600">
                      <Clock size={12} />
                      <p className="text-[9px] font-black uppercase tracking-widest italic">{new Date(action.ACT_CreatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : INDICATEURS ET CONTEXTE */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/40 border border-white/10 p-10 rounded-[3.5rem] sticky top-40 shadow-3xl backdrop-blur-md">
              <h3 className="text-2xl font-black uppercase italic mb-8 border-b border-white/5 pb-6 tracking-tighter text-left leading-none">
                Intelligence <span className="text-blue-500">SMQ</span>
              </h3>
              
              <div className="space-y-8 text-left">
                <div className="flex items-center gap-6 p-6 bg-blue-600/5 rounded-4xl border border-blue-500/20 shadow-inner group">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-lg group-hover:scale-110 transition-transform">
                    <Target size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest mb-1 leading-none">Processus Indexé</p>
                    <p className="text-xl font-black text-white italic tracking-tighter leading-none mb-2">{currentProcess?.PR_Code || 'N/A'}</p>
                    <p className="text-[10px] text-blue-400 font-black uppercase italic tracking-widest">{currentProcess?.PR_Libelle?.slice(0, 20)}...</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-black uppercase italic tracking-widest text-slate-500">
                    <span>Avancement des tâches</span>
                    <span className="text-blue-500">{Math.round((tasks.filter((t: any) => t.itemStatus === 'TERMINE').length / (tasks.length || 1)) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-950 rounded-full h-4 p-1 shadow-inner border border-white/5">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${(tasks.filter((t: any) => t.itemStatus === 'TERMINE').length / (tasks.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isDelayed && (
                  <div className="bg-red-600/10 border border-red-500/20 rounded-[2.5rem] p-8 flex items-center gap-5 shadow-2xl animate-in zoom-in-95">
                    <div className="w-14 h-14 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 shadow-lg">
                      <Clock className="animate-pulse" size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase italic tracking-widest leading-none mb-1">Impact Risque</p>
                      <p className="text-xl font-black text-red-400 italic tracking-tighter leading-none">
                        DÉPASSEMENT : {Math.ceil((new Date().getTime() - new Date(action.ACT_Deadline).getTime()) / (1000 * 60 * 60 * 24))} JRS
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-white/5">
                   <div className="flex items-center gap-3 text-slate-500">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <p className="text-[9px] font-black uppercase italic tracking-[0.2em]">Conformité ISO 9001:2015 §10.2</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * 📎 COMPOSANT : GESTIONNAIRE DE PREUVES (§7.5.3)
 */
function EvidenceManager({ evidences: initialEvidences, actionId, onUpdate }: { evidences: any[], actionId: string, onUpdate: (e: any[]) => void }) {
  const [evidences, setEvidences] = useState(initialEvidences);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { setEvidences(initialEvidences); }, [initialEvidences]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !actionId) return;
    setIsUploading(true);
    const tid = toast.loading("Indexation de la preuve...");
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('PV_ActionId', actionId);

    try {
      const res = await apiClient.post('/preuves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newEvidences = [...evidences, res.data];
      setEvidences(newEvidences);
      onUpdate(newEvidences);
      toast.success("Preuve physique indexée §7.5.3", { id: tid });
    } catch (err) {
      toast.error("Échec du transfert documentaire", { id: tid });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("VOULEZ-VOUS PURGER CETTE PREUVE DE L'ARCHIVE ?")) return;
    try {
      await apiClient.delete(`/preuves/${id}`);
      const filtered = evidences.filter((e: any) => e.PV_Id !== id);
      setEvidences(filtered);
      onUpdate(filtered);
      toast.success("Preuve archivée supprimée");
    } catch (err) {
      toast.error("Erreur de suppression archive");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-4">
          <ShieldCheck className="text-emerald-400" size={24} />
          Registre des Preuves
        </h3>
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-3 italic tracking-widest shadow-3xl shadow-blue-900/40 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Paperclip size={18} /> 
          {isUploading ? 'INDEXATION...' : 'AJOUTER UNE PREUVE'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evidences.map((ev: any) => (
          <div key={ev.PV_Id} className="bg-slate-950/40 p-6 rounded-4xl border border-white/5 hover:border-blue-500/30 transition-all group shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-black uppercase italic text-white truncate leading-none mb-2">{ev.PV_FileName}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                    ARCHIVÉ LE : {new Date(ev.PV_CreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <a href={ev.PV_FileUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all text-slate-400 hover:text-white">
                  <ExternalLink size={16} />
                </a>
                <button onClick={() => handleDelete(ev.PV_Id)} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all text-slate-400 hover:text-white border-none cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {evidences.length === 0 && (
          <div className="col-span-2 py-32 border-2 border-dashed border-white/5 rounded-[4rem] text-center bg-white/2">
            <ShieldCheck className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
            <p className="text-slate-600 font-black uppercase italic text-xs tracking-[0.4em] leading-relaxed">
              DÉFAUT DE PREUVE MATÉRIELLE (§7.5.3)<br/>AUCUN DOCUMENT RATTACHÉ À CE DOSSIER
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-slate-950/40 rounded-4xl p-8 border border-white/5 text-left shadow-inner">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic leading-none">{label}</p>
      <p className={`text-2xl font-black uppercase italic tracking-tighter leading-none ${color || 'text-slate-200'}`}>{value || 'INDÉTERMINÉ'}</p>
    </div>
  );
}