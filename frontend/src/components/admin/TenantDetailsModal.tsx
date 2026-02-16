/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { matrixApi, TenantDetails, UserMatrixEntry } from '@/services/matrix.service';
import { X, Building2, Users, Trash2, Edit, Plus, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'sonner';
import MatrixUserModal from './MatrixUserModal';

interface Props {
  tenantId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantDetailsModal({ tenantId, isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<TenantDetails | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMatrixEntry | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await matrixApi.getDetails(tenantId);
      setDetails(data);
    } catch (err) {
      toast.error("ERREUR : Impossible de synchroniser les données du tenant.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [tenantId, onClose]);

  useEffect(() => {
    if (isOpen && tenantId) fetchDetails();
  }, [isOpen, tenantId, fetchDetails]);

  const handleDeleteUser = async (u: UserMatrixEntry) => {
    if (!confirm(`⚠️ SUPPRESSION DÉFINITIVE\n\nConfirmez-vous l'effacement de l'agent ${u.U_Email} ?`)) return;
    try {
      await matrixApi.deleteUser(u.U_Id);
      toast.success("Agent révoqué avec succès.");
      fetchDetails();
    } catch (err: any) {
      toast.error("ÉCHEC RÉVOCATION : " + (err.response?.data?.message || "Erreur"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300 italic">
      <MatrixUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSuccess={() => { setIsUserModalOpen(false); fetchDetails(); }}
        userToEdit={selectedUser} 
      />

      <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div className="p-10 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{details?.T_Name || "Chargement..."}</h2>
            <p className="text-blue-600 font-black text-xs mt-2 flex items-center gap-2 uppercase tracking-widest">
              <Globe size={16} /> {details?.T_Domain}.qualisoft.sn
            </p>
          </div>
          <button onClick={onClose} className="p-4 bg-white border-2 border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer">
            <X size={28} />
          </button>
        </div>

        <div className="overflow-y-auto p-10 space-y-10 flex-1">
          <div className="grid grid-cols-3 gap-6">
             <div className="p-6 bg-slate-900 text-white rounded-3xl">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instance Plan</p>
                <p className="text-2xl font-black italic mt-1">{details?.T_Plan}</p>
             </div>
             <div className="p-6 bg-blue-600 text-white rounded-3xl">
                <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Population</p>
                <p className="text-2xl font-black italic mt-1">{details?._count?.T_Users} Agents</p>
             </div>
             <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut Nœud</p>
                <p className={`text-2xl font-black italic mt-1 ${details?.T_IsActive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {details?.T_IsActive ? 'OPÉRATIONNEL' : 'SUSPENDU'}
                </p>
             </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black uppercase text-slate-900 flex items-center gap-3 italic">
                 <Users size={24} className="text-blue-600"/> Registre des Accès
               </h3>
               <button onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }} className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl cursor-pointer">
                 <Plus size={16} /> Nouvel Agent
               </button>
            </div>

            <div className="border-2 border-slate-100 rounded-4xl overflow-hidden bg-white">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b-2 border-slate-100">
                   <tr>
                     <th className="p-6 text-[11px] font-black uppercase text-slate-400">Agent / Identité</th>
                     <th className="p-6 text-[11px] font-black uppercase text-slate-400">Accréditation (Role)</th>
                     <th className="p-6 text-[11px] font-black uppercase text-slate-400 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-slate-50">
                   {details?.T_Users.map((u) => (
                     <tr key={u.U_Id} className="hover:bg-blue-50/30 transition-colors group">
                       <td className="p-6">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm italic">
                             {u.U_LastName?.[0]}{u.U_FirstName?.[0]}
                           </div>
                           <div>
                             <p className="text-sm font-black text-slate-900 uppercase italic">{u.U_FirstName} {u.U_LastName}</p>
                             <p className="text-xs font-bold text-slate-400 lowercase">{u.U_Email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="p-6">
                         <span className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center w-fit gap-2">
                            <ShieldCheck size={14} className="text-blue-600" /> {u.U_Role}
                         </span>
                       </td>
                       <td className="p-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }} className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-600 text-slate-400 hover:text-blue-600 transition-all cursor-pointer"><Edit size={18} /></button>
                           <button onClick={() => handleDeleteUser(u)} className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-red-600 text-slate-400 hover:text-red-600 transition-all cursor-pointer"><Trash2 size={18} /></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}