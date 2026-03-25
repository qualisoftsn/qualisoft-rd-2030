/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚙️ MODULE : WorkflowDesigner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Modélisation séquentielle de la chaîne de responsabilité.
 * RÉVISION : 03 Mars 2026 | 00:15 GMT
 */

"use client";

import { Plus, Trash2, X, GitCommit, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

interface WorkflowStep {
  order: number;
  approverId: string;
  label: string;
}

interface WorkflowDesignerProps {
  entityId: string;
  entityType: 'DOCUMENT' | 'ACTION' | 'AUDIT' | 'SSE' | 'CAUSERIE';
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WorkflowDesigner({ entityId, entityType, onClose, onSuccess }: WorkflowDesignerProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([{ order: 1, approverId: '', label: 'APPROBATION INITIALE' }]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("ERREUR : Registre des habilitations inaccessible.");
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const saveCircuit = async () => {
    if (steps.some(s => !s.approverId)) {
      return toast.warning("CONFORMITÉ : Chaque maillon doit être assigné.");
    }

    setLoading(true);
    const tid = toast.loading("Scellage du circuit de validation...");

    try {
      await apiClient.post('/workflows/initiate', { entityId, entityType, steps });
      toast.success("CIRCUIT DÉPLOYÉ ET SCELLÉ", { id: tid });
      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) { 
      toast.error("ÉCHEC MATRICIEL : Rejet de la configuration", { id: tid }); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-200 bg-[#0B0F1A]/95 backdrop-blur-3xl flex items-center justify-center p-6 italic font-sans animate-in fade-in duration-500">
      <div className="bg-[#0F172A] border-2 border-white/5 w-full max-w-2xl rounded-[4rem] p-12 shadow-4xl relative overflow-hidden text-left">
        <GitCommit className="absolute -bottom-10 -left-10 text-white opacity-5 rotate-12" size={300} />

        <header className="flex justify-between items-center mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-3xl shadow-blue-600/40 animate-pulse">
               <GitCommit size={36} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Circuit <span className="text-blue-500">Master</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3 m-0">Validation séquentielle des actifs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-slate-500 hover:text-white transition-all border-none cursor-pointer"><X size={28} /></button>
        </header>

        <div className="space-y-4 mb-12 max-h-100 overflow-y-auto pr-4 custom-scrollbar relative z-10">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-center bg-black/40 p-6 rounded-[2.5rem] border border-white/5 group hover:border-blue-600/50 transition-all shadow-inner">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xs font-black text-white group-hover:bg-blue-600 transition-colors">{s.order}</div>
              <div className="flex-1 space-y-3">
                <input 
                  className="w-full bg-transparent border-b border-white/10 outline-none text-[11px] font-black uppercase italic text-white focus:border-blue-500 py-2"
                  value={s.label} onChange={(e) => { const n = [...steps]; n[i].label = e.target.value.toUpperCase(); setSteps(n); }}
                />
                <select 
                  className="w-full bg-transparent border-none text-[10px] font-black uppercase italic text-slate-400 outline-none cursor-pointer appearance-none"
                  value={s.approverId} onChange={(e) => { const n = [...steps]; n[i].approverId = e.target.value; setSteps(n); }}
                >
                  <option value="" className="bg-slate-900">-- CHOISIR APPROBATEUR --</option>
                  {users.map(u => <option key={u.U_Id} value={u.U_Id} className="bg-slate-900">{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
              </div>
              <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i).map((st, idx) => ({ ...st, order: idx + 1 })))} className="p-4 hover:bg-red-500/10 rounded-2xl text-slate-700 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"><Trash2 size={20} /></button>
            </div>
          ))}
          <button onClick={() => setSteps([...steps, { order: steps.length + 1, approverId: '', label: `ÉTAPE ${steps.length + 1}` }])} className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase text-slate-500 hover:text-blue-500 hover:border-blue-600/40 transition-all flex items-center justify-center gap-3 bg-transparent cursor-pointer">
            <Plus size={18} strokeWidth={3} /> Ajouter un maillon de validation
          </button>
        </div>

        <button onClick={saveCircuit} disabled={loading} className="w-full bg-blue-600 py-8 rounded-[3rem] text-xs font-black uppercase italic tracking-[0.4em] text-white shadow-4xl hover:bg-white hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer relative z-10">
          {loading ? <RefreshCw className="animate-spin" size={24} /> : <ShieldCheck size={24} />} 
          {loading ? "SCELLAGE..." : "VERROUILLER LE CIRCUIT MASTER"}
        </button>
      </div>
    </div>
  );
}
