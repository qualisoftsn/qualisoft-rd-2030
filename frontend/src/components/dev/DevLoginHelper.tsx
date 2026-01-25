/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, Building2, Users, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';

export default function DevLoginHelper() {
  const { setLogin } = useAuthStore();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Simulation des données du SEED (à remplacer par un appel API si tu veux du dynamique)
  const devData = [
    { 
      T_Id: "ELITE-CORE-001", 
      T_Name: "EXCELLENCE INDUSTRIES", 
      users: [{ email: "admin@excellence.sn", role: "ADMIN" }] 
    },
    { 
      T_Id: "tenant-senelec-id", 
      T_Name: "SENELEC SA", 
      users: [{ email: "admin@senelec.sn", role: "ADMIN" }, { email: "pilote@senelec.sn", role: "PILOTE" }] 
    }
  ];

  if (process.env.NODE_ENV !== 'development') return null;

  const handleExecuteConnect = async (email: string) => {
    try {
      // On utilise les vrais identifiants du SEED
      const response = await apiClient.post('/auth/login', {
        U_Email: email,
        U_Password: 'Password123' 
      });

      setLogin({ token: response.data.access_token, user: response.data.user });
      setIsOpen(false);
      router.push('/admin/structure');
    } catch (err) {
      alert("Erreur : L'utilisateur n'existe pas pour ce Tenant dans la base.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-999 bg-[#f59e0b] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
      >
        <Rocket size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-1000 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-3xl italic font-sans">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Sélecteur d&apos;Instance Elite</h3>
              <button onClick={() => {setIsOpen(false); setSelectedTenant(null)}}><X /></button>
            </div>

            <div className="p-8 space-y-4">
              {!selectedTenant ? (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Choisir un Tenant :</p>
                  {devData.map(t => (
                    <button key={t.T_Id} onClick={() => setSelectedTenant(t)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                      <Building2 className="text-blue-500" />
                      <div>
                        <p className="font-black text-sm uppercase">{t.T_Name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">ID: {t.T_Id.substring(0,8)}...</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 size={12}/> {selectedTenant.T_Name} / Utilisateurs :
                  </p>
                  {selectedTenant.users.map((u: any) => (
                    <button key={u.email} onClick={() => handleExecuteConnect(u.email)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all text-left">
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-blue-300" />
                        <span className="text-xs font-bold">{u.email}</span>
                      </div>
                      <span className="text-[9px] bg-white/10 px-2 py-1 rounded-md font-black">{u.role}</span>
                    </button>
                  ))}
                  <button onClick={() => setSelectedTenant(null)} className="w-full text-center text-[10px] font-black uppercase text-slate-400 mt-4">Retour aux tenants</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}