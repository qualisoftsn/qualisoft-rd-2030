/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { UserPlus, Shield, User, Trash2, Mail } from 'lucide-react';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);

  // Fonction de chargement des données
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Gestion des <span className="text-blue-600">Utilisateurs</span>
          </h1>
          <p className="text-slate-500 italic">Contrôlez les accès et les rôles de vos collaborateurs.</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
          <UserPlus size={18} /> Ajouter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              {/* Avatar Icon */}
              <div className={`p-4 rounded-2xl ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {user.role === 'ADMIN' ? <Shield size={24} /> : <User size={24} />}
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {user.prenom} {user.nom}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-sm text-slate-400 font-medium italic">
                    <Mail size={14} /> {user.email}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-white">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
               <div className="text-right mr-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Service</p>
                  <p className="text-sm font-bold text-blue-600 italic">{user.service?.nom || 'Non rattaché'}</p>
               </div>
               <button className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                  <Trash2 size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}