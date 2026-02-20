/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : SUPER-ADMIN MONITORING (MATRIX CONTROL)
 * -------------------------------------------------------------------------
 * FONCTION : Hub central de surveillance des instances clients (Tenants).
 * RÔLE : Monitoring de l'état d'activation, de l'usage (utilisateurs) et du plan de licence.
 * ARCHITECTURE : Communication directe avec le Matrix Service pour le pilotage cross-tenant.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
// 🛠️ IMPORTATION DU SERVICE CORE MATRIX
import { matrixApi, TenantDetails } from '@/services/matrix.service';
import { 
  Plus, Globe, Users as UsersIcon, RefreshCw, 
  Loader2, ShieldCheck, Activity, Database, AlertCircle 
} from 'lucide-react';
import DeployTenantModal from '@/components/admin/DeployTenantModal';
import { toast } from 'react-hot-toast';

export default function SuperAdminDashboard() {
  // --- ÉTATS DE GESTION DU REGISTRE ---
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  /**
   * 🔄 SYNCHRONISATION AVEC LE NOYAU MATRIX
   * Récupère la liste exhaustive des instances scellées dans l'infrastructure.
   */
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      // Appel du service master matrix pour récupérer les métadonnées globales
      const data = await matrixApi.getTenants();
      setTenants(Array.isArray(data) ? data : []);
      setLastUpdate(new Date());
      
      // Feedback visuel discret pour confirmer la synchro
      if (!loading) toast.success("Matrice d'instances synchronisée");
    } catch (error) {
      console.error("Défaut de liaison Matrix:", error);
      toast.error("Rupture de communication avec le Noyau Matrix");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initialisation du monitoring au montage
  useEffect(() => {
    fetchTenants();
    
    // ⏱️ RAFRAÎCHISSEMENT AUTOMATIQUE (Optionnel : toutes les 5 minutes)
    const interval = setInterval(fetchTenants, 300000);
    return () => clearInterval(interval);
  }, [fetchTenants]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans italic text-left">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* 🚀 HEADER STRATÉGIQUE DE SUPERVISION */}
        <header className="flex justify-between items-end border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-3 text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-3">
               <Activity size={14} /> Matrix Real-Time Monitoring
            </div>
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Supervision <span className="text-blue-600">Matrix</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
              Vue globale des instances déployées • Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-5 rounded-4xl font-black uppercase text-[11px] hover:bg-blue-600 transition-all flex items-center gap-4 shadow-2xl active:scale-95 border-none cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} /> Déployer Nouvelle Instance
          </button>
        </header>

        {/* 📊 GRILLE DE KPI SYSTÈME (Optionnel - Consolidation visuelle) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase italic">Total Instances</p>
             <p className="text-3xl font-black text-slate-900 mt-1">{tenants.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase italic">Utilisateurs Globaux</p>
             <p className="text-3xl font-black text-slate-900 mt-1">
               {tenants.reduce((acc, t) => acc + (t._count?.T_Users || 0), 0)}
             </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase italic">Statut Infrastructure</p>
             <p className="text-3xl font-black text-emerald-500 mt-1 flex items-center gap-2">Opérationnel <Database size={20}/></p>
          </div>
        </div>

        {/* 📋 REGISTRE ACTIF DES INSTANCES (SMI TENANTS) */}
        <section className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4 italic">
              <Globe size={24} className="text-blue-500" /> Registre des Instances Scellées
            </h2>
            <button 
              onClick={fetchTenants} 
              disabled={loading}
              className="p-4 bg-slate-50 rounded-full hover:rotate-180 transition-all duration-700 border-none cursor-pointer group"
              title="Forcer la synchronisation"
            >
              <RefreshCw size={20} className={`text-slate-400 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && tenants.length === 0 ? (
            <div className="flex flex-col items-center py-32 gap-6 opacity-40">
              <Loader2 className="animate-spin text-blue-600" size={50} />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Lecture de la structure Matrix...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-32 text-slate-300">
              <ShieldCheck size={80} className="mx-auto mb-6 opacity-10" />
              <p className="font-black uppercase tracking-[0.5em] text-sm">Aucune instance détectée dans le périmètre</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {tenants.map((tenant) => (
                <div 
                  key={tenant.T_Id} 
                  className="group flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all border border-slate-100 hover:border-blue-200 relative overflow-hidden"
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${tenant.T_IsActive ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_15px_currentColor]`} />
                      {tenant.T_IsActive && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase text-2xl italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                        {tenant.T_Name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2 italic">
                        <Database size={12} /> {tenant.T_Domain}.qualisoft.sn • <span className="text-blue-500/70">{tenant.T_Plan}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12 relative z-10">
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Population Active</p>
                      <p className="text-2xl font-black text-slate-900 flex items-center justify-end gap-3 tracking-tighter">
                        {tenant._count?.T_Users || 0} <UsersIcon size={20} className="text-blue-500" />
                      </p>
                    </div>
                    <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic border ${
                      tenant.T_IsActive 
                      ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' 
                      : 'bg-red-500/5 text-red-600 border-red-500/20'
                    }`}>
                      {tenant.T_IsActive ? 'SÉCURISÉ' : 'SUSPENDU'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE DÉPLOIEMENT : ACCÈS MASTER */}
      {isModalOpen && (
        <DeployTenantModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTenants(); // Re-synchro après déploiement
          }} 
        />
      )}
    </div>
  );
}