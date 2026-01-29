'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, Target, User, Calendar, ArrowLeft, 
  Loader2, CheckCircle2, Layers, ArrowRight, X, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: 'MEDIUM',
    ACT_Origin: 'AUTRE',
    ACT_Type: 'CORRECTIVE',
    ACT_ResponsableId: '',
    ACT_ProcessusId: '', // OBLIGATOIRE selon schéma
    ACT_PAQId: '',
    ACT_Deadline: '',
    tasks: [] as { titre: string; responsableId: string }[]
  });

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resU, resP, resPlans, resProc] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/paq'),
          apiClient.get('/action-plans'),
          apiClient.get('/processes')
        ]);
        setUsers(resU.data);
        setPaqs(resP.data);
        setPlans(resPlans.data);
        setProcesses(resProc.data);
      } catch (err) { 
        toast.error("Erreur chargement données référentiel");
      }
    };
    loadRefs();
  }, []);

  const handleSubmit = async () => {
    if (!formData.ACT_ProcessusId) {
      toast.error("Veuillez sélectionner un processus obligatoirement");
      return;
    }
    
    setLoading(true);
    try {
      // Création de l'action
      const actionRes = await apiClient.post('/actions', {
        ...formData,
        ACT_Status: 'A_FAIRE'
      });
      
      // Création des tâches associées si présentes
      if (formData.tasks.length > 0 && formData.tasks[0].titre) {
        await Promise.all(formData.tasks.map(task => 
          apiClient.post('/action-items', {
            itemTitre: task.titre,
            itemResponsableId: task.responsableId || formData.ACT_ResponsableId,
            itemEcheance: formData.ACT_Deadline,
            itemStatus: 'A_FAIRE',
            actionId: actionRes.data.ACT_Id
          })
        ));
      }
      
      toast.success('Action créée avec succès dans le processus ' + 
        processes.find(p => p.PR_Id === formData.ACT_ProcessusId)?.PR_Code);
      router.push(`/dashboard/improvement/actions/${actionRes.data.ACT_Id}`);
    } catch (err) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Identification', icon: Target },
    { id: 2, title: 'Rattachement Processus', icon: Layers },
    { id: 3, title: 'Décomposition', icon: CheckCircle2 },
  ];

  const canProceed = () => {
    if (step === 1) return formData.ACT_Title.length > 3;
    if (step === 2) return formData.ACT_ProcessusId && formData.ACT_ResponsableId && formData.ACT_Deadline;
    return true;
  };

  const selectedProcess = processes.find(p => p.PR_Id === formData.ACT_ProcessusId);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 p-10">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-[10px] font-black uppercase tracking-widest transition-all"
      >
        <ArrowLeft size={16} /> Retour au Hub
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-2">
          Nouvelle <span className="text-blue-500">Action</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">
          Plan d'Amélioration Continue • Étape {step}/3
        </p>

        <div className="flex gap-4 mb-12">
          {steps.map((s) => (
            <div key={s.id} className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border transition-all ${
              step >= s.id ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-900/40 border-white/5 text-slate-600'
            }`}>
              <s.icon size={20} />
              <span className="text-[10px] font-black uppercase">{s.title}</span>
              {step > s.id && <CheckCircle2 size={16} className="ml-auto" />}
            </div>
          ))}
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">
                  Intitulé de l'action *
                </label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-lg font-bold uppercase italic outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                  placeholder="Ex: Mise en place du nouveau protocole..."
                  value={formData.ACT_Title}
                  onChange={e => setFormData({...formData, ACT_Title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">
                  Description détaillée
                </label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                  placeholder="Contexte, justification, objectifs attendus..."
                  value={formData.ACT_Description}
                  onChange={e => setFormData({...formData, ACT_Description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">Origine</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500"
                    value={formData.ACT_Origin}
                    onChange={e => setFormData({...formData, ACT_Origin: e.target.value})}
                  >
                    <option value="AUDIT">Audit Interne/Externe</option>
                    <option value="COPIL">COPIL / Revue Direction</option>
                    <option value="NON_CONFORMITE">Non-Conformité</option>
                    <option value="RECLAMATION">Réclamation Client</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">Type</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500"
                    value={formData.ACT_Type}
                    onChange={e => setFormData({...formData, ACT_Type: e.target.value})}
                  >
                    <option value="CORRECTIVE">Corrective</option>
                    <option value="PREVENTIVE">Préventive</option>
                    <option value="AMELIORATION">Amélioration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">Priorité</label>
                <div className="grid grid-cols-4 gap-4">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setFormData({...formData, ACT_Priority: prio})}
                      className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${
                        formData.ACT_Priority === prio 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-950 border-white/10 text-slate-500 hover:border-white/30'
                      }`}
                    >
                      {prio === 'LOW' && 'Basse'}
                      {prio === 'MEDIUM' && 'Moyenne'}
                      {prio === 'HIGH' && 'Haute'}
                      {prio === 'URGENT' && 'Urgente'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-blue-500/5 border-2 border-blue-500/30 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-blue-400" size={20} />
                  <label className="text-[11px] font-black uppercase text-blue-400 tracking-widest">
                    Processus Concerné *
                  </label>
                </div>
                
                <select 
                  required
                  className="w-full bg-slate-950 border border-blue-500/50 rounded-2xl p-6 text-sm font-bold outline-none focus:border-blue-500 text-white shadow-lg shadow-blue-900/20 relative z-10 mb-4"
                  value={formData.ACT_ProcessusId}
                  onChange={e => setFormData({...formData, ACT_ProcessusId: e.target.value})}
                >
                  <option value="">Sélectionner un processus...</option>
                  {processes.map((proc: any) => (
                    <option key={proc.PR_Id} value={proc.PR_Id}>
                      {proc.PR_Code} - {proc.PR_Libelle}
                    </option>
                  ))}
                </select>
                
                <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-wider">
                  * Champs obligatoires ISO 9001 - Approche processus
                </p>

                {selectedProcess && (
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-[10px] text-blue-300 uppercase font-black">Processus sélectionné</p>
                    <p className="text-sm font-bold text-white">{selectedProcess.PR_Libelle}</p>
                    <p className="text-[10px] text-blue-400">Pilote: {selectedProcess.PR_Pilote?.U_FirstName} {selectedProcess.PR_Pilote?.U_LastName}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block flex items-center gap-2">
                    <User size={12} /> Responsable *
                  </label>
                  <select 
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500"
                    value={formData.ACT_ResponsableId}
                    onChange={e => setFormData({...formData, ACT_ResponsableId: e.target.value})}
                  >
                    <option value="">Assigner à...</option>
                    {users.map((u: any) => (
                      <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block flex items-center gap-2">
                    <Calendar size={12} /> Échéance *
                  </label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 text-white"
                    value={formData.ACT_Deadline}
                    onChange={e => setFormData({...formData, ACT_Deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">PAQ (optionnel)</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500"
                    value={formData.ACT_PAQId}
                    onChange={e => setFormData({...formData, ACT_PAQId: e.target.value})}
                  >
                    <option value="">Aucun PAQ</option>
                    {paqs.map((p: any) => (
                      <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Year} - {p.PAQ_Processus?.PR_Libelle}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">Plan NC (optionnel)</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500"
                    value={formData.ACT_PlanId}
                    onChange={e => setFormData({...formData, ACT_PlanId: e.target.value})}
                  >
                    <option value="">Aucun plan</option>
                    {plans.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>{plan.planTitre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 mb-6">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500 font-bold">Action:</span> {formData.ACT_Title}</p>
                  <p><span className="text-slate-500 font-bold">Processus:</span> {selectedProcess?.PR_Libelle}</p>
                  <p><span className="text-slate-500 font-bold">Priorité:</span> {formData.ACT_Priority}</p>
                  <p><span className="text-slate-500 font-bold">Échéance:</span> {formData.ACT_Deadline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 font-bold mb-4">
                Décomposer en tâches (optionnel)
              </p>
              
              {formData.tasks.map((task, idx) => (
                <div key={idx} className="flex gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 items-end">
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Tâche {idx + 1}</label>
                    <input 
                      placeholder="Libellé de la tâche"
                      className="w-full bg-transparent border-b border-white/10 pb-2 text-sm font-bold outline-none focus:border-blue-500"
                      value={task.titre}
                      onChange={e => {
                        const newTasks = [...formData.tasks];
                        newTasks[idx].titre = e.target.value;
                        setFormData({...formData, tasks: newTasks});
                      }}
                    />
                  </div>
                  <div className="w-48">
                    <select 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      value={task.responsableId}
                      onChange={e => {
                        const newTasks = [...formData.tasks];
                        newTasks[idx].responsableId = e.target.value;
                        setFormData({...formData, tasks: newTasks});
                      }}
                    >
                      <option value="">Même responsable</option>
                      {users.map((u: any) => (
                        <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, tasks: formData.tasks.filter((_, i) => i !== idx)})}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => setFormData({...formData, tasks: [...formData.tasks, { titre: '', responsableId: '' }]})}
                className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:text-white hover:border-blue-500/50 transition-all text-[10px] font-black uppercase"
              >
                + Ajouter une tâche détaillée
              </button>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-white/5">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-30 hover:bg-white/5 transition-all"
            >
              Précédent
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
              >
                Suivant <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Créer l'Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}