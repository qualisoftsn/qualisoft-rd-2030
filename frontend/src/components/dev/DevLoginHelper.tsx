/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : DevLoginHelper.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Orchestrateur de test pour switch rapide inter-tenants.
 * RÔLE : Bypass de l'authentification manuelle via Injection Matrix.
 * SÉCURITÉ : Auto-destruction hors environnement 'development'.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:58 GMT
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Rocket, Building2, Users, X, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DevLoginHelper() {
  const { setLogin } = useAuthStore() as any;
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isDev, setIsDev] = useState(false);

  /**
   * 🛡️ VÉRIFICATION D'ENVIRONNEMENT
   * On s'assure que le module ne s'active que sur localhost.
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true);
    }
  }, []);

  // 📂 REGISTRE DES INSTANCES DE TEST (SYNCHRONISÉ AVEC LE SEED DB)
  const devData = [
    { 
      T_Id: "ELITE-CORE-001", 
      T_Name: "QUALI-CORP HQ", 
      users: [
        { email: "ab.thiongane@qualisoft.sn", role: "SUPER_ADMIN" },
        { email: "admin@qualisoft.sn", role: "ADMIN" }
      ] 
    },
    { 
      T_Id: "tenant-senelec-id", 
      T_Name: "SENELEC SA", 
      users: [
        { email: "dir.qualite@senelec.sn", role: "RQ" },
        { email: "pilote.hse@senelec.sn", role: "PILOTE" }
      ] 
    },
    { 
      T_Id: "tenant-pad-id", 
      T_Name: "PORT AUTONOME DAKAR", 
      users: [
        { email: "admin@pad.sn", role: "ADMIN" }
      ] 
    }
  ];

  if (!isDev) return null;

  /**
   * ⚡ PROTOCOLE DE CONNEXION ÉCLAIR
   * On bypass le login form en injectant directement les credentials via l'API.
   */
  const bypassAuthentication = async (email: string) => {
    const tid = toast.loading(`Bypass en cours pour ${email}...`);
    try {
      const response = await apiClient.post('/auth/login', {
        U_Email: email,
        U_Password: 'Password123' // Password standard des environnements de dev
      });

      // Injection dans le store Matrix
      setLogin({ 
        token: response.data.access_token, 
        user: response.data.user 
      });

      toast.success("ACCÈS MATRICIEL AUTORISÉ", { id: tid });
      setIsOpen(false);
      
      // Propulsion vers le dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error("ÉCHEC DU BYPASS : Utilisateur inconnu au bataillon.", { id: tid });
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-9999 font-sans italic">
      
      {/* 🧨 TRIGGER FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 bg-amber-500 text-white rounded-3xl shadow-4xl hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer group"
      >
        <Rocket size={28} className="group-hover:animate-bounce" />
      </button>

      {/* 🛸 MODAL DE CONTEXTE DEV */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-4xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
            
            {/* HEADER */}
            <header className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter m-0 italic flex items-center gap-3 text-slate-900">
                  <Cpu size={24} className="text-amber-500" /> Matrix <span className="text-amber-500">Dev</span> Hub
                </h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 m-0 leading-none">Simulateur d&apos;Ancrage Multi-Tenant</p>
              </div>
              <button onClick={() => {setIsOpen(false); setSelectedTenant(null)}} className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all cursor-pointer">
                <X size={20} />
              </button>
            </header>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {!selectedTenant ? (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">--- SÉLECTIONNER INSTANCE CIBLE ---</p>
                  <div className="space-y-3">
                    {devData.map(t => (
                      <button key={t.T_Id} onClick={() => setSelectedTenant(t)}
                        className="w-full flex items-center gap-5 p-5 rounded-4xl border-2 border-slate-50 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group bg-white cursor-pointer">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm uppercase tracking-tighter italic m-0 text-slate-900 truncate">{t.T_Name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 m-0 opacity-60">ID: {t.T_Id}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
                    <ShieldAlert size={18} className="text-amber-600" />
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest m-0 italic">
                       Basculement vers : {selectedTenant.T_Name}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedTenant.users.map((u: any) => (
                      <button key={u.email} onClick={() => bypassAuthentication(u.email)}
                        className="w-full flex items-center justify-between p-6 rounded-3xl bg-slate-950 text-white hover:bg-amber-500 transition-all border-none cursor-pointer group shadow-xl">
                        <div className="flex items-center gap-4 min-w-0">
                          <Users size={18} className="text-amber-500 group-hover:text-white transition-colors" />
                          <span className="text-[11px] font-black italic tracking-tight truncate">{u.email}</span>
                        </div>
                        <span className="text-[8px] bg-white/10 px-3 py-1 rounded-lg font-black uppercase tracking-widest">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setSelectedTenant(null)} className="w-full text-center text-[10px] font-black uppercase text-slate-400 mt-10 hover:text-amber-600 transition-all border-none bg-transparent cursor-pointer italic tracking-widest">
                    RETOUR AU REGISTRE DES INSTANCES
                  </button>
                </>
              )}
            </div>

            <footer className="p-6 bg-slate-50 border-t border-slate-100">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center m-0 italic">
                 Matrix Dev Protocol RD-2026 • Environment: {process.env.NODE_ENV}
               </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
