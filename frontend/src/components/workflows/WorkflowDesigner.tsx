/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Plus, Trash2, Save, X, GitCommit, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

export default function WorkflowDesigner({ entityId, entityType, onClose }: any) {
  const [steps, setSteps] = useState([{ order: 1, approverId: '', label: 'Étape 1' }]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Chargement des approbateurs potentiels pour éviter le approverId vide
  useEffect(() => {
    apiClient.get('/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const saveCircuit = async () => {
    if (steps.some(s => !s.approverId)) {
      return toast.error("Veuillez choisir un approbateur pour chaque étape");
    }
    setLoading(true);
    try {
      await apiClient.post('/workflows/initiate', { entityId, entityType, steps });
      toast.success("Circuit de validation déployé");
      onClose();
    } catch (e) { 
      toast.error("Erreur 500: Vérifiez les logs backend"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-[#0F172A] border border-white/5 w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black uppercase italic flex items-center gap-3">
            <GitCommit className="text-blue-600" /> Circuit <span className="text-blue-600">Master</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
        </div>

        <div className="space-y-4 mb-10 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-blue-600/30 transition-all">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">{s.order}</div>
              <input 
                className="flex-1 bg-transparent border-b border-white/10 outline-none text-[10px] font-black uppercase italic"
                value={s.label}
                onChange={(e) => {
                  const n = [...steps]; n[i].label = e.target.value; setSteps(n);
                }}
              />
              <select 
                className="bg-[#0B0F1A] border border-white/10 rounded-lg p-2 text-[9px] font-bold uppercase outline-none"
                value={s.approverId}
                onChange={(e) => {
                   const n = [...steps]; n[i].approverId = e.target.value; setSteps(n);
                }}
              >
                <option value="">Approbateur</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName}</option>)}
              </select>
              <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}><Trash2 size={16} className="text-red-500" /></button>
            </div>
          ))}
          <button 
            onClick={() => setSteps([...steps, { order: steps.length + 1, approverId: '', label: `Étape ${steps.length + 1}` }])} 
            className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase hover:border-blue-600/50 transition-all"
          >
            + Ajouter Maillon
          </button>
        </div>

        <button 
          onClick={saveCircuit} 
          disabled={loading}
          className="w-full bg-blue-600 py-5 rounded-2xl text-[11px] font-black uppercase italic shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Save size={18} />} 
          Verrouiller le circuit
        </button>
      </div>
    </div>
  );
}