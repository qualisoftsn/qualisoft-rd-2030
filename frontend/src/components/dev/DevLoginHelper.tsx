/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🚀 MODULE : DEV LOGIN HELPER (L'ORCHESTRATEUR DE TEST)
 * -------------------------------------------------------------------------
 * FONCTION : Simulation de connexion pour les tests de développement.
 * RÔLE : Permettre au développeur de basculer instantanément entre les Tenants.
 * SÉCURITÉ : Strictement limité à l'environnement 'development'.
 */

import React, { useState } from 'react';
import { Rocket, Building2, Users, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';

export default function DevLoginHelper() {
  const { setLogin } = useAuthStore();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // 📂 REGISTRE DES INSTANCES DE TEST (SIMULATION SEED)
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

  // Garde-fou environnemental
  if (process.env.NODE_ENV !== 'development') return null;

  /**
   * ⚡ EXECUTION DU BYPASS AUTHENTICATION
   * Injecte le jeton et l'identité dans le store Matrix.
   */
  const handleExecuteConnect = async (email: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        U_Email: email,
        U_Password: 'Password123' // Mot de passe standardisé du SEED
      });

      setLogin({ token: response.data.access_token, user: response.data.user });
      setIsOpen(false);
      router.push('/admin/structure');
    } catch (err) {
      alert("ERREUR CRITIQUE : Le Kernel rejette cet utilisateur (User inexistant dans ce Tenant).");
    }
  };

  return (
    <>
      {/* TRIGGER : BOUTON FUSÉE */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-999 bg-[#f59e0b] text-white p-5 rounded-3xl shadow-4xl hover:scale-110 active:scale-95 transition-all border-none cursor-pointer"
        title="Ouvrir le Matrix Dev Hub"
      >
        <Rocket size={26} className="animate-bounce" />
      </button>

      {/* MODAL DE SÉLECTION D'INSTANCE */}
      {isOpen && (
        <div className="fixed inset-0 z-1000 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 italic">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300">
            
            {/* HEADER */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none italic">Matrix Dev <span className="text-blue-600">Hub</span></h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Simulateur d&apos;Ancrage Tenant</p>
              </div>
              <button onClick={() => {setIsOpen(false); setSelectedTenant(null)}} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {!selectedTenant ? (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Sélectionner Instance :</p>
                  {devData.map(t => (
                    <button key={t.T_Id} onClick={() => setSelectedTenant(t)}
                      className="w-full flex items-center gap-5 p-5 rounded-4xl border-2 border-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group border-none cursor-pointer">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase tracking-tight italic">{t.T_Name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {t.T_Id.substring(0,12)}...</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                    <Building2 size={14}/> {selectedTenant.T_Name} / Agents scellés :
                  </p>
                  <div className="space-y-3">
                    {selectedTenant.users.map((u: any) => (
                      <button key={u.email} onClick={() => handleExecuteConnect(u.email)}
                        className="w-full flex items-center justify-between p-5 rounded-3xl bg-slate-900 text-white hover:bg-blue-600 transition-all text-left border-none cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <Users size={18} className="text-blue-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-black italic">{u.email}</span>
                        </div>
                        <span className="text-[9px] bg-white/10 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">{u.role}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSelectedTenant(null)} className="w-full text-center text-[10px] font-black uppercase text-slate-400 mt-8 hover:text-blue-600 transition-all border-none bg-transparent cursor-pointer italic tracking-[0.2em]">Retour au registre des instances</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}