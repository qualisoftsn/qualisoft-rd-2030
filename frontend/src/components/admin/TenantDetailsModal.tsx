/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 🏢 MODULE : TENANT DETAILS MASTER
 * -------------------------------------------------------------------------
 * FONCTION : Cockpit de gestion avancée d'une organisation (Tenant).
 * RÔLE : Audit de population, gestion du statut opérationnel et des accès.
 * ISOLATION : Toutes les données sont scellées par le tenantId passé en paramètre.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { matrixApi, TenantDetails, UserMatrixEntry } from '@/services/matrix.service';
import { X, Building2, Users, Trash2, Edit, Plus, ShieldCheck, Globe, Activity, Mail } from 'lucide-react';
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

  /**
   * 📡 SYNCHRONISATION MASTER
   * Récupère l'intégralité du registre organisationnel depuis le Kernel.
   */
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

  /**
   * ⚠️ RÉVOCATION D'ACCÈS
   * Supprime définitivement un agent du registre Matrix.
   */
  const handleDeleteUser = async (u: UserMatrixEntry) => {
    if (!confirm(`⚠️ SUPPRESSION DÉFINITIVE\n\nConfirmez-vous l'effacement de l'agent ${u.U_Email} ?\nCette action est irréversible.`)) return;
    try {
      await matrixApi.deleteUser(u.U_Id);
      toast.success("Agent révoqué et identité effacée.");
      fetchDetails();
    } catch (err: any) {
      toast.error("ÉCHEC RÉVOCATION : " + (err.response?.data?.message || "Erreur critique"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300 italic">
      
      {/* MODAL D'ÉDITION D'UTILISATEUR (NESTED) */}
      <MatrixUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSuccess={() => { setIsUserModalOpen(false); fetchDetails(); }}
        userToEdit={selectedUser} 
      />

      <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 font-sans text-left">
        {/* HEADER DU COCKPIT */}
        <div className="p-10 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {details?.T_Name || "Initialisation..."}
            </h2>
            <p className="text-blue-600 font-black text-xs mt-2 flex items-center gap-2 uppercase tracking-widest italic">
              <Globe size={16} /> {details?.T_Domain}.qualisoft.sn
            </p>
          </div>
          <button onClick={onClose} className="p-4 bg-white border-2 border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border-none shadow-sm">
            <X size={28} />
          </button>
        </div>

        <div className="overflow-y-auto p-10 space-y-10 flex-1">
          {/* GRILLE DE STATUT D'INSTANCE */}
          <div className="grid grid-cols-3 gap-6">
             <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Plan d&apos;Instance</p>
                <p className="text-2xl font-black italic uppercase tracking-tighter">{details?.T_Plan}</p>
                <Activity className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity" size={80} />
             </div>
             <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1 italic">Population Active</p>
                <p className="text-2xl font-black italic uppercase tracking-tighter">{details?._count?.T_Users} Agents Scellés</p>
                <Users className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity" size={80} />
             </div>
             <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] relative overflow-hidden group">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Statut Nœud</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${details?.T_IsActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <p className={`text-2xl font-black italic uppercase tracking-tighter ${details?.T_IsActive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {details?.T_IsActive ? 'OPÉRATIONNEL' : 'SUSPENDU'}
                  </p>
                </div>
             </div>
          </div>

          {/* REGISTRE DES ACCÈS (USERS LIST) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
               <h3 className="text-xl font-black uppercase text-slate-900 flex items-center gap-4 italic tracking-tighter">
                 <ShieldCheck size={28} className="text-blue-600"/> Registre des Accréditations
               </h3>
               <button onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }} 
                       className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase italic hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl cursor-pointer border-none active:scale-95">
                 <Plus size={16} strokeWidth={3} /> Nouvel Agent
               </button>
            </div>

            <div className="border-2 border-slate-100 rounded-[3rem] overflow-hidden bg-white shadow-inner">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b-2 border-slate-100">
                   <tr>
                     <th className="p-8 text-[11px] font-black uppercase text-slate-400 italic tracking-widest">Agent / Identité Matrix</th>
                     <th className="p-8 text-[11px] font-black uppercase text-slate-400 italic tracking-widest">Accréditation (Rôle)</th>
                     <th className="p-8 text-[11px] font-black uppercase text-slate-400 text-right italic tracking-widest">Actions de Contrôle</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-slate-50">
                   {details?.T_Users.map((u) => (
                     <tr key={u.U_Id} className="hover:bg-blue-50/40 transition-all group">
                       <td className="p-8">
                         <div className="flex items-center gap-5">
                           <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg italic shadow-lg border border-white/10 group-hover:bg-blue-600 transition-colors">
                             {u.U_LastName?.[0]}{u.U_FirstName?.[0]}
                           </div>
                           <div>
                             <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none">{u.U_FirstName} {u.U_LastName}</p>
                             <p className="text-xs font-bold text-slate-400 lowercase mt-2 flex items-center gap-2"><Mail size={12}/> {u.U_Email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="p-8">
                         <span className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] flex items-center w-fit gap-3 italic shadow-sm group-hover:border-blue-200 transition-colors">
                            <ShieldCheck size={14} className="text-blue-600" /> {u.U_Role}
                         </span>
                       </td>
                       <td className="p-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }} className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-600 text-slate-400 hover:text-blue-600 transition-all cursor-pointer shadow-sm"><Edit size={18} /></button>
                           <button onClick={() => handleDeleteUser(u)} className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-red-600 text-slate-400 hover:text-red-600 transition-all cursor-pointer shadow-sm"><Trash2 size={18} /></button>
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