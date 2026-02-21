/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⚙️ MODULE : WORKFLOW DESIGNER (MOTEUR D'APPROBATION)
 * -------------------------------------------------------------------------
 * FONCTION : Création et modification des circuits de validation (PAQ, GED).
 * RÔLE : Assigner des responsabilités séquentielles pour la libération d'actifs.
 * ISOLATION : Les approbateurs disponibles sont limités au Tenant actif.
 */

import { Plus, Trash2, X, GitCommit, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// Types stricts pour garantir l'intégrité du flux
interface WorkflowStep {
  order: number;
  approverId: string;
  label: string;
}

interface WorkflowDesignerProps {
  entityId: string;
  entityType: 'DOCUMENT' | 'ACTION' | 'AUDIT' | 'SSE';
  onClose: () => void;
}

export default function WorkflowDesigner({ entityId, entityType, onClose }: WorkflowDesignerProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([{ order: 1, approverId: '', label: 'Étape 1' }]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🛰️ Synchronisation des habilitations du Tenant
  useEffect(() => {
    apiClient.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Erreur de synchronisation avec le registre des utilisateurs."));
  }, []);

  const saveCircuit = async () => {
    // 🛡️ Barrière d'intégrité : Aucun maillon faible autorisé
    if (steps.some(s => !s.approverId || s.approverId.trim() === '')) {
      return toast.error("QUALISOFT KERNEL : Chaque étape requiert un approbateur formellement identifié.");
    }
    
    setLoading(true);
    try {
      // Injection de la configuration dans la Matrice
      await apiClient.post('/workflows/initiate', { entityId, entityType, steps });
      toast.success("Circuit de validation scellé et déployé avec succès.");
      onClose();
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Erreur de déploiement : Vérifiez l'intégrité du flux."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#0B0F1A]/95 backdrop-blur-2xl flex items-center justify-center p-6 italic font-sans animate-in fade-in duration-300">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(37,99,235,0.15)] relative overflow-hidden">
        
        {/* HEADER ELITE */}
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 text-white animate-pulse">
               <GitCommit size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                Circuit <span className="text-blue-500">Master</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Configuration de validation séquentielle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all border-none bg-transparent cursor-pointer">
            <X size={28} />
          </button>
        </div>

        {/* BUILDER DE FLUX */}
        <div className="space-y-4 mb-10 max-h-96 overflow-y-auto pr-4 custom-scrollbar relative z-10 text-left">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-center bg-white/5 p-5 rounded-3xl border border-white/5 group hover:border-blue-600/50 transition-all shadow-inner">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md shadow-blue-600/20">
                {s.order}
              </div>
              
              <input 
                className="flex-1 bg-transparent border-b-2 border-white/10 outline-none text-[11px] font-black uppercase text-white tracking-widest focus:border-blue-500 transition-all py-2"
                value={s.label}
                placeholder="LIBELLÉ DE L'ÉTAPE..."
                onChange={(e) => {
                  const n = [...steps]; 
                  n[i].label = e.target.value.toUpperCase(); 
                  setSteps(n);
                }}
              />
              
              <select 
                className="bg-[#0B0F1A] border-2 border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase outline-none text-slate-300 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-45"
                value={s.approverId}
                onChange={(e) => {
                   const n = [...steps]; 
                   n[i].approverId = e.target.value; 
                   setSteps(n);
                }}
              >
                <option value="">-- DÉSIGNER L&apos;APPROBATEUR --</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
              
              <button 
                onClick={() => setSteps(steps.filter((_, idx) => idx !== i).map((step, index) => ({...step, order: index + 1})))}
                className="p-3 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setSteps([...steps, { order: steps.length + 1, approverId: '', label: `ÉTAPE ${steps.length + 1}` }])} 
            className="w-full py-5 border-2 border-dashed border-white/10 rounded-4xl text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 hover:border-blue-600/50 transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
          >
            <Plus size={16} /> Ajouter un maillon au circuit
          </button>
        </div>

        {/* VERROUILLAGE SOUVERAIN */}
        <button 
          onClick={saveCircuit} 
          disabled={loading}
          className="w-full bg-blue-600 py-6 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer relative z-10"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
          Verrouiller & Déployer le circuit
        </button>

        {/* Décoration de fond */}
        <GitCommit className="absolute -bottom-10 -right-10 text-white opacity-5 rotate-45" size={250} />
      </div>
    </div>
  );
}