/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⚙️ MODULE : WORKFLOW DESIGNER (ARCHITECTE DE CIRCUIT)
 * -------------------------------------------------------------------------
 * FONCTION : Modélisation séquentielle des étapes d'approbation (§8.1 ISO 9001).
 * RÔLE : Définir la chaîne de responsabilités pour la validation d'actifs scellés.
 * ISOLATION : Les approbateurs sont strictement filtrés par le périmètre du Tenant.
 * SÉCURITÉ : onSuccess() assure la mise à jour immédiate du cockpit après scellage.
 */

import { Plus, Trash2, X, GitCommit, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// 🛡️ INTERFACE SCELLÉE (Correction du Type Error)
interface WorkflowStep {
  order: number;
  approverId: string;
  label: string;
}

interface WorkflowDesignerProps {
  entityId: string;
  entityType: 'DOCUMENT' | 'ACTION' | 'AUDIT' | 'SSE' | 'CAUSERIE';
  onClose: () => void;
  onSuccess?: () => void; // ✅ Signal de synchronisation ajouté
}

export default function WorkflowDesigner({ entityId, entityType, onClose, onSuccess }: WorkflowDesignerProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([{ order: 1, approverId: '', label: 'APPROBATION INITIALE' }]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL HUMAIN
   * Chargement des utilisateurs accrédités au sein du Tenant.
   */
  useEffect(() => {
    apiClient.get('/users')
      .then(res => setUsers(res.data || []))
      .catch(() => toast.error("ERREUR : Impossible d'accéder au registre des habilitations."));
  }, []);

  /**
   * 🚀 SCELLAGE DU CIRCUIT MATRIX
   * Validation et transmission du workflow au Kernel.
   */
  const saveCircuit = async () => {
    // Vérification de l'intégrité des maillons
    if (steps.some(s => !s.approverId || s.approverId.trim() === '')) {
      return toast.error("CONFORMITÉ REJETÉE : Chaque maillon doit avoir un approbateur désigné.");
    }

    setLoading(true);
    const tid = toast.loading("Scellage du circuit de validation...");

    try {
      // Transmission au Kernel via API Client (Multi-Tenant Header auto-injecté)
      await apiClient.post('/workflows/initiate', { 
        entityId, 
        entityType, 
        steps 
      });

      toast.success("CIRCUIT DÉPLOYÉ ET SCELLÉ", { id: tid });

      // 🔄 PROTOCOLE DE RETOUR
      if (onSuccess) {
        onSuccess(); // Déclenche fetchTasks() dans la page parente
      } else {
        onClose();
      }
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "ÉCHEC MATRICIEL : Le Kernel a rejeté la configuration.", { id: tid }); 
    } finally { 
      setLoading(false); 
    }
  };

  /**
   * 🛠️ GESTION DES MAILLONS (ADD/REMOVE)
   */
  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, approverId: '', label: `ÉTAPE ${steps.length + 1}` }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(newSteps);
  };

  return (
    <div className="fixed inset-0 z-500 bg-[#0B0F1A]/95 backdrop-blur-3xl flex items-center justify-center p-6 italic font-sans animate-in fade-in duration-500">
      
      {/* TERMINAL DE CONCEPTION ELITE */}
      <div className="bg-[#0F172A] border-2 border-white/5 w-full max-w-2xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden">
        
        {/* FILIGRANE MATRIX */}
        <GitCommit className="absolute -bottom-10 -left-10 text-white opacity-5 rotate-12" size={300} />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/30 text-white animate-pulse">
               <GitCommit size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                Circuit <span className="text-blue-500">Master</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2 italic">Architecture de validation séquentielle</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-500 transition-all border border-white/5 shadow-inner cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* LISTE DES ÉTAPES (SCROLLABLE) */}
        <div className="space-y-4 mb-12 max-h-100 overflow-y-auto pr-4 custom-scrollbar relative z-10 text-left">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-center bg-[#0B0F1A]/50 p-6 rounded-[2.5rem] border border-white/5 group hover:border-blue-600/50 transition-all shadow-inner">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg">
                {s.order}
              </div>
              
              <div className="flex-1 space-y-2">
                <input 
                  className="w-full bg-transparent border-b border-white/10 outline-none text-[11px] font-black uppercase italic text-white focus:border-blue-500 transition-all py-1 placeholder:text-slate-700"
                  value={s.label}
                  placeholder="NOMMER L'ÉTAPE..."
                  onChange={(e) => {
                    const n = [...steps]; n[i].label = e.target.value.toUpperCase(); setSteps(n);
                  }}
                />
                <div className="flex items-center gap-2">
                  <UserCheck size={12} className="text-blue-500" />
                  <select 
                    className="flex-1 bg-transparent border-none text-[10px] font-black uppercase italic text-slate-400 outline-none cursor-pointer appearance-none"
                    value={s.approverId}
                    onChange={(e) => {
                       const n = [...steps]; n[i].approverId = e.target.value; setSteps(n);
                    }}
                  >
                    <option value="">-- CHOISIR APPROBATEUR --</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => removeStep(i)}
                className="p-4 hover:bg-red-500/10 rounded-2xl text-slate-600 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <button 
            onClick={addStep} 
            className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase text-slate-500 hover:text-blue-500 hover:border-blue-600/40 transition-all flex items-center justify-center gap-3 bg-transparent cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} /> Ajouter un maillon de validation
          </button>
        </div>

        {/* VALIDATION FINALE */}
        <button 
          onClick={saveCircuit} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] text-xs font-black uppercase italic tracking-[0.3em] text-white shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer relative z-10"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
          {loading ? "SCELLAGE..." : "Verrouiller le circuit Master"}
        </button>

      </div>
    </div>
  );
}