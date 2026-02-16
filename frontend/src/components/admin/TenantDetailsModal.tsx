/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// 👇 AJOUT DE useCallback DANS L'IMPORT
import React, { useState, useEffect, useCallback } from 'react';
import { matrixApi, TenantDetails, UserMatrixEntry } from '@/services/matrix.service';
import { X, Building2, User, Mail, Shield, Calendar, Users, Activity, Trash2, Edit, Plus, Loader2 } from 'lucide-react';
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
  
  // 🛠️ GESTION DU CRUD UTILISATEUR
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMatrixEntry | null>(null);

  // ✅ CORRECTION ICI : On utilise useCallback pour stabiliser la fonction
  const fetchDetails = useCallback(async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const data = await matrixApi.getDetails(tenantId);
      setDetails(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible de charger les détails du tenant");
      onClose(); // On ferme si on ne peut pas charger
    } finally {
      setLoading(false);
    }
  }, [tenantId, onClose]); // Les dépendances de la fonction elle-même

  // ✅ CORRECTION ICI : On ajoute fetchDetails aux dépendances
  useEffect(() => {
    if (isOpen && tenantId) {
      fetchDetails();
    }
  }, [isOpen, tenantId, fetchDetails]);

  // 🗑️ ACTION : SUPPRIMER UN UTILISATEUR
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ DANGER MATRIX\n\nÊtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${userEmail} ?\nCette action est irréversible.`)) {
      return;
    }

    try {
      const toastId = toast.loading("Suppression en cours...");
      await matrixApi.deleteUser(userId);
      toast.dismiss(toastId);
      toast.success("Utilisateur supprimé de la Matrix.");
      
      // On rafraîchit la liste immédiatement
      fetchDetails();
    } catch (err: any) {
      console.error("Erreur suppression", err);
      toast.error("Échec suppression : " + (err.response?.data?.message || "Erreur inconnue"));
    }
  };

  // ✏️ ACTION : OUVRIR MODALE EN ÉDITION
  const handleEditUser = (user: UserMatrixEntry) => {
    // On injecte l'ID du tenant actuel pour que la modal sache où on est
    const userWithContext = { ...user, tenantId: details?.T_Id };
    setSelectedUser(userWithContext);
    setIsUserModalOpen(true);
  };

  // ➕ ACTION : OUVRIR MODALE EN CRÉATION
  const handleCreateUser = () => {
    setSelectedUser(null); // Null = Mode Création
    setIsUserModalOpen(true);
  };

  // Callback quand la modal a fini son travail (Succès)
  const onUserOperationSuccess = () => {
    setIsUserModalOpen(false);
    fetchDetails(); // On recharge les données fraîches
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* --- INTÉGRATION DE LA MODAL CRUD --- */}
      <MatrixUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSuccess={onUserOperationSuccess}
        userToEdit={selectedUser} // Si null -> Création, Sinon -> Édition
      />

      <div className="bg-white rounded-4xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300 font-sans italic">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            {loading ? (
              <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"/>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{details?.T_Name}</h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${details?.T_IsActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {details?.T_IsActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-slate-400 font-bold text-xs mt-1 flex items-center gap-2">
                   <Building2 size={14} /> {details?.T_Domain}.qualisoft.sn
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 shadow-sm cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* CONTENU SCROLLABLE */}
        <div className="overflow-y-auto flex-1 p-8 space-y-8">
          
          {/* STATS RAPIDES */}
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-400">Plan Souscrit</p>
                <p className="text-xl font-black text-blue-900 mt-1">{details?.T_Plan || 'ESSAI'}</p>
             </div>
             <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-[10px] font-black uppercase text-purple-400">Utilisateurs</p>
                <p className="text-xl font-black text-purple-900 mt-1">{details?._count?.T_Users || 0}</p>
             </div>
             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase text-emerald-400">Sites Déployés</p>
                <p className="text-xl font-black text-emerald-900 mt-1">{details?._count?.T_Sites || 0}</p>
             </div>
          </div>

          {/* LISTE DES UTILISATEURS (LE COEUR DU CRUD) */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-black uppercase text-slate-800 flex items-center gap-2">
                 <Users size={18} className="text-blue-600"/> Effectif & Accès
               </h3>
               
               {/* BOUTON CRÉER (NOUVEL AGENT) */}
               <button 
                 onClick={handleCreateUser}
                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
               >
                 <Plus size={14} /> Ajouter un Agent
               </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden min-h-50">
               <table className="w-full text-left">
                 <thead className="bg-slate-100 border-b border-slate-200">
                   <tr>
                     <th className="p-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Identité</th>
                     <th className="p-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Rôle Matrix</th>
                     <th className="p-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
                     <th className="p-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {details?.T_Users.map((u) => (
                     <tr key={u.U_Id} className="hover:bg-white transition-colors group">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shadow-sm">
                             {u.U_FirstName?.[0]}{u.U_LastName?.[0]}
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-900">{u.U_FirstName} {u.U_LastName}</p>
                             <p className="text-[10px] text-slate-500">{u.U_Email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-2">
                           <Shield size={12} className={u.U_Role === 'ADMIN' ? 'text-blue-600' : 'text-slate-400'} />
                           <span className="text-[10px] font-bold uppercase text-slate-700">{u.U_Role}</span>
                         </div>
                       </td>
                       <td className="p-4">
                         <span className={`w-2 h-2 rounded-full block ${u.U_IsActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                       </td>
                       
                       {/* 🛠️ COLONNE ACTIONS (CRUD) */}
                       <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           
                           {/* BOUTON ÉDITION */}
                           <button 
                             onClick={() => handleEditUser(u)}
                             className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all cursor-pointer"
                             title="Modifier l'utilisateur"
                           >
                             <Edit size={14} />
                           </button>

                           {/* BOUTON SUPPRESSION */}
                           <button 
                             onClick={() => handleDeleteUser(u.U_Id, u.U_Email)}
                             className="p-2 bg-white border border-slate-200 rounded-lg hover:border-red-500 hover:text-red-600 hover:shadow-md transition-all cursor-pointer"
                             title="Supprimer définitivement"
                           >
                             <Trash2 size={14} />
                           </button>

                         </div>
                       </td>
                     </tr>
                   ))}
                   
                   {details?.T_Users.length === 0 && !loading && (
                     <tr>
                       <td colSpan={4} className="p-8 text-center text-slate-400 text-xs italic">
                         Aucun utilisateur dans cette organisation.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}