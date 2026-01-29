/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Clock, User, Calendar, 
  Paperclip, CheckCircle2, MessageSquare, 
  Edit3, Save, Trash2, ExternalLink, FileText,
  Target, Loader2, X, ArrowRight, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [action, setAction] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'evidence' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [actionRes, tasksRes, evidRes, procRes] = await Promise.all([
          apiClient.get(`/actions/${params.id}`),
          apiClient.get(`/actions/${params.id}/tasks`),
          apiClient.get(`/actions/${params.id}/evidences`),
          apiClient.get('/processes')
        ]);
        setAction(actionRes.data);
        setEditData(actionRes.data);
        setTasks(tasksRes.data);
        setEvidences(evidRes.data);
        setProcesses(procRes.data);
      } catch (err) {
        toast.error("Erreur chargement action");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const handleUpdate = async () => {
    try {
      await apiClient.patch(`/actions/${params.id}`, editData);
      setAction(editData);
      setIsEditing(false);
      toast.success("Action mise à jour");
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Confirmer la suppression définitive ?")) return;
    try {
      await apiClient.delete(`/actions/${params.id}`);
      toast.success("Action supprimée");
      router.push('/dashboard/improvement');
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] ml-72 flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-black uppercase flex items-center gap-3">
        <Loader2 className="animate-spin" /> Chargement...
      </div>
    </div>
  );

  const currentProcess = processes.find((p: any) => p.PR_Id === action.ACT_ProcessusId);
  const isDelayed = action.ACT_Deadline && new Date(action.ACT_Deadline) < new Date() && 
    action.ACT_Status !== 'TERMINEE' && action.ACT_Status !== 'ANNULEE';

  const statusColors: any = {
    'A_FAIRE': 'bg-slate-800 text-slate-400',
    'EN_COURS': 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    'TERMINEE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    'ANNULEE': 'bg-red-500/20 text-red-400 border-red-500/20'
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72">
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-10 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button 
            onClick={() => router.push('/dashboard/improvement?tab=actions')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all"
                >
                  <Edit3 size={14} /> Modifier
                </button>
                <button 
                  onClick={handleDelete}
                  className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {setIsEditing(false); setEditData(action);}}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all"
                >
                  <X size={14} /> Annuler
                </button>
                <button 
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40"
                >
                  <Save size={14} /> Enregistrer
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${statusColors[action.ACT_Status]}`}>
                  {action.ACT_Status?.replace('_', ' ')}
                </span>
                
                {currentProcess && (
                  <span className="bg-blue-600 text-white border border-blue-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                    <Target size={10} /> {currentProcess.PR_Code}
                  </span>
                )}
                
                <span className="bg-slate-800 text-slate-400 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                  {action.ACT_Origin?.replace('_', ' ')}
                </span>

                {isDelayed && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-pulse flex items-center gap-1">
                    <Clock size={10} /> RETARD
                  </span>
                )}
              </div>

              {isEditing ? (
                <input 
                  type="text"
                  value={editData.ACT_Title}
                  onChange={(e) => setEditData({...editData, ACT_Title: e.target.value})}
                  className="w-full bg-slate-950 border border-blue-500/30 rounded-2xl p-6 text-3xl font-black uppercase italic text-white outline-none focus:border-blue-500 mb-4"
                />
              ) : (
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
                  {action.ACT_Title}
                </h1>
              )}

              {isEditing ? (
                <textarea 
                  value={editData.ACT_Description || ''}
                  onChange={(e) => setEditData({...editData, ACT_Description: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-sm font-bold text-slate-300 outline-none focus:border-blue-500 min-h-[120px]"
                  placeholder="Description..."
                />
              ) : (
                <p className="text-slate-400 text-sm font-bold leading-relaxed">
                  {action.ACT_Description || "Aucune description détaillée."}
                </p>
              )}
            </div>

            <div className="flex gap-2 border-b border-white/5 pb-1">
              {[
                { id: 'details', label: 'Détails', icon: FileText },
                { id: 'tasks', label: `Tâches (${tasks.length})`, icon: CheckCircle2 },
                { id: 'evidence', label: `Preuves (${evidences.length})`, icon: Paperclip },
                { id: 'history', label: 'Historique', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-slate-900/60 text-blue-400 border-t border-l border-r border-white/10' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 rounded-tl-none min-h-[400px]">
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase italic">Décomposition</h3>
                    <button className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all">
                      + Nouvelle tâche
                    </button>
                  </div>
                  {tasks.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 font-bold uppercase text-[10px]">
                      Aucune tâche décomposée
                    </div>
                  ) : (
                    tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          task.itemStatus === 'TERMINE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700 text-slate-400'
                        }`}>
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold uppercase text-slate-200">{task.itemTitre}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-black mt-1">
                            {task.responsable?.U_FirstName} {task.responsable?.U_LastName} • {task.itemStatus}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'evidence' && (
                <EvidenceManager evidences={evidences} actionId={params.id as string} onUpdate={setEvidences} />
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3 block">Processus *</label>
                      <select 
                        className="w-full bg-slate-950 border border-blue-500/30 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 text-white"
                        value={editData.ACT_ProcessusId}
                        onChange={e => setEditData({...editData, ACT_ProcessusId: e.target.value})}
                      >
                        {processes.map((proc: any) => (
                          <option key={proc.PR_Id} value={proc.PR_Id}>
                            {proc.PR_Code} - {proc.PR_Libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <InfoField 
                      label="Processus Concerné" 
                      value={currentProcess?.PR_Libelle || 'Non défini'} 
                      color="text-blue-400"
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField label="Priorité" value={action.ACT_Priority} color={
                      action.ACT_Priority === 'URGENT' ? 'text-red-500' : 
                      action.ACT_Priority === 'HIGH' ? 'text-orange-500' : 'text-slate-200'
                    } />
                    <InfoField label="Échéance" value={action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : '—'} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField 
                      label="Responsable" 
                      value={`${action.ACT_Responsable?.U_FirstName || ''} ${action.ACT_Responsable?.U_LastName || ''}`} 
                    />
                    <InfoField label="Date de création" value={new Date(action.ACT_CreatedAt).toLocaleDateString()} />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/30 rounded-2xl border-l-2 border-blue-500">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Création</p>
                    <p className="text-sm text-slate-300">Action créée dans le système</p>
                    <p className="text-[9px] text-slate-600 mt-1">{new Date(action.ACT_CreatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] sticky top-40">
              <h3 className="text-lg font-black uppercase italic mb-6 border-b border-white/5 pb-4">
                Contexte Processus
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-black">Processus</p>
                    <p className="text-lg font-black text-white italic">{currentProcess?.PR_Libelle || 'N/A'}</p>
                    <p className="text-[10px] text-blue-400 font-bold">{currentProcess?.PR_Code}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Avancement</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-800 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(tasks.filter((t: any) => t.itemStatus === 'TERMINE').length / (tasks.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black">
                      {Math.round((tasks.filter((t: any) => t.itemStatus === 'TERMINE').length / (tasks.length || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {isDelayed && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
                    <Clock className="text-red-500" size={24} />
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase">Action en Retard</p>
                      <p className="text-xs text-red-400 font-bold">
                        {Math.ceil((new Date().getTime() - new Date(action.ACT_Deadline).getTime()) / (1000 * 60 * 60 * 24))} jours
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EvidenceManager({ evidences: initialEvidences, actionId, onUpdate }: { evidences: any[], actionId: string, onUpdate: (e: any[]) => void }) {
  const [evidences, setEvidences] = useState(initialEvidences);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
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
      toast.success("Document ajouté");
    } catch (err) {
      toast.error("Erreur upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await apiClient.delete(`/preuves/${id}`);
      const filtered = evidences.filter((e: any) => e.PV_Id !== id);
      setEvidences(filtered);
      onUpdate(filtered);
      toast.success("Document supprimé");
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black uppercase italic flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" size={20} />
          Preuves de conformité
        </h3>
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
          <Paperclip size={14} /> 
          {isUploading ? 'Upload...' : 'Ajouter'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {evidences.map((ev: any) => (
          <div key={ev.PV_Id} className="bg-slate-800/30 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{ev.PV_FileName}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black mt-1">
                    {new Date(ev.PV_CreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={ev.PV_FileUrl} target="_blank" className="p-2 hover:text-blue-400 transition-colors">
                  <ExternalLink size={16} />
                </a>
                <button onClick={() => handleDelete(ev.PV_Id)} className="p-2 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {evidences.length === 0 && (
          <div className="col-span-2 py-20 border-2 border-dashed border-slate-800 rounded-3xl text-center">
            <ShieldCheck className="mx-auto text-slate-700 mb-4" size={32} />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
              Aucune preuve rattachée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-lg font-black uppercase ${color || 'text-slate-200'}`}>{value || '—'}</p>
    </div>
  );
}