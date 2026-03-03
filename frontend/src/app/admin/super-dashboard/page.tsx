/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : SovereignDashboard (Super-Admin Console)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage centralisé du Kernel Qualisoft.
 * FONCTIONS : Management des Nœuds (Tenants), Tunnel d'Incarnation, Purge.
 * RÉVISION : 03 Mars 2026 | 09:15 GMT
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/core/api/api-client";
import Sidebar from "@/app/dashboard/sidebar"; // Vérifie que le chemin d'import est correct
import { 
  Database, Globe, ShieldCheck, Zap, Search, 
  Crown, Terminal, Clock, ExternalLink, 
  Activity, Settings2, Plus, Loader2, 
  ChevronLeft, Save, Trash2, Edit3, Fingerprint
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Role, Tenant } from "@/types/elite-sde";

// Optimisation Matrix pour rendu dynamique
export const dynamic = 'force-dynamic';

type SovereignView = "MATRIX" | "TENANT_EDIT";

export default function SovereignDashboard() {
  const router = useRouter();
  const { user, setLogin, isAuthenticated } = useAuthStore() as any;
  
  const [hasMounted, setHasMounted] = useState(false);
  const [view, setView] = useState<SovereignView>("MATRIX");
  const [activeTenant, setActiveTenant] = useState<Tenant | any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fix Hydratation : Montage sécurisé du Noyau
  useEffect(() => { 
    setHasMounted(true); 
  }, []);

  /**
   * 📡 SYNCHRONISATION MATRIX
   * Extraction des données de tous les nœuds territoriaux.
   */
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/super-admin/tenants");
      const extractedData = res.data?.data || res.data || [];
      setTenants(Array.isArray(extractedData) ? extractedData : []);
    } catch (err: any) {
      toast.error("ÉCHEC MATRICIEL : Synchronisation avec le Noyau impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (hasMounted && isAuthenticated && (user?.U_Role === Role.SUPER_ADMIN || user?.U_Role === 'SUPER_ADMIN')) {
      fetchTenants(); 
    }
  }, [fetchTenants, hasMounted, isAuthenticated, user]);

  /**
   * 🎭 ACTION : TUNNEL D'INCARNATION (IMPERSONATION)
   * Basculement de l'Architecte dans une instance client pour audit/support.
   */
  const handleImpersonate = async (tenantId: string) => {
    const tid = toast.loading("Séquençage du Tunnel d'Incarnation...");
    try {
      const res = await apiClient.post(`/admin/super-admin/impersonate/${tenantId}`);
      
      // Mise à jour souveraine du store global avec les nouvelles identités
      setLogin({
        token: res.data.accessToken,
        user: res.data.user,
        isMaster: true // On garde le flag master actif
      });
      
      toast.success("MODE INCARNATION ACTIF : Identité scellée", { id: tid });
      
      // Migration forcée vers le dashboard du tenant
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("TUNNEL REFUSÉ : Le Nœud a rejeté l'incarnation.", { id: tid });
    }
  };

  /**
   * ✍️ ACTION : SCELLAGE DES PROTOCOLES
   */
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;

    const tid = toast.loading("Scellage des nouveaux protocoles...");
    try {
      await apiClient.patch(`/admin/super-admin/tenants/${activeTenant.T_Id}`, activeTenant);
      toast.success("REGISTRE MATRIX MIS À JOUR", { id: tid });
      setView("MATRIX");
      fetchTenants();
    } catch (err) {
      toast.error("REJET DU KERNEL : Structure de données invalide.", { id: tid });
    }
  };

  /**
   * 🗑️ ACTION : PURGE ATOMIQUE
   */
  const handleDeleteTenant = async (id: string) => {
    if (!confirm("⚠️ ALERTE SÉCURITÉ : Purger définitivement ce nœud ?")) return;
    
    const tid = toast.loading("Purge du système en cours...");
    try {
      await apiClient.delete(`/admin/super-admin/tenants/${id}`);
      toast.success("INSTANCE PURGÉE : Données atomisées.", { id: tid });
      fetchTenants();
    } catch (err) {
      toast.error("PURGE IMPOSSIBLE : Dépendances SMI encore actives.", { id: tid });
    }
  };

  // Filtrage temps réel memoïsé
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.T_Name?.toLowerCase().includes(search.toLowerCase()) ||
      t.T_Domain?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tenants, search]);

  // 🛡️ BARRIÈRE DE SÉCURITÉ SOUVERAINE
  if (!hasMounted || !isAuthenticated) return null;
  
  if (user?.U_Role !== Role.SUPER_ADMIN && user?.U_Role !== 'SUPER_ADMIN') {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-8 italic">
        <div className="relative">
            <ShieldCheck className="text-red-500 animate-pulse" size={80} />
            <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/20" size={40} />
        </div>
        <p className="text-red-500 font-black uppercase tracking-[0.5em] m-0">Accès Matrix Refusé</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0F1A] overflow-hidden italic selection:bg-blue-600/30 font-sans">
      
      {/* 🧭 NAVIGATION RÉGALIENNE (Sidebar corrigée) */}
      <Sidebar isSuperAdmin={true} />

      <div className="flex-1 flex flex-col pl-80 min-w-0 transition-all duration-700">
        
        {/* HEADER HUB SOUVERAIN */}
        <header className="h-28 bg-[#0B0F1A]/90 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-30 backdrop-blur-2xl">
           <div className="flex items-center gap-8">
              {view !== "MATRIX" && (
                <button onClick={() => setView("MATRIX")} className="p-5 bg-white/5 rounded-3xl hover:bg-blue-600 transition-all group border-none cursor-pointer">
                  <ChevronLeft size={24} className="text-blue-500 group-hover:text-white" />
                </button>
              )}
              <div className="text-left">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
                    {view === "MATRIX" ? "System Matrix" : "Configuration Nœud"}
                  </h2>
                  <div className="flex items-center gap-3 mt-3">
                     <Activity size={12} className="text-blue-500" />
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic m-0">
                       Qualisoft Global Cluster • Root Authority
                     </p>
                  </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 shadow-2xl shadow-amber-900/10">
                 <Crown size={20} className="text-amber-500" />
                 <span className="text-[11px] font-black uppercase text-amber-500 italic tracking-[0.3em]">Architecte Master</span>
              </div>
           </div>
        </header>

        {/* WORKSPACE MATRIX */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">

          {/* --- VUE LISTING --- */}
          {view === "MATRIX" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-16">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                 <div className="relative group flex-1 max-w-3xl w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-all" size={24} />
                    <input 
                      type="text" placeholder="RECHERCHER UNE INSTANCE SCELLÉE..." 
                      className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-10 text-xs font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-700 shadow-inner"
                      value={search} onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <button className="bg-white text-black hover:bg-blue-600 hover:text-white px-12 py-8 rounded-[2.5rem] font-black uppercase text-[12px] italic shadow-4xl flex items-center gap-5 transition-all active:scale-95 border-none cursor-pointer">
                    <Plus size={22} /> Déployer Nouveau Nœud
                 </button>
              </div>

              {loading ? (
                <div className="py-60 flex flex-col items-center gap-6">
                  <Loader2 className="animate-spin text-blue-500" size={64} />
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] italic">Analyse du Cluster en cours...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 pb-32">
                  {filteredTenants.length === 0 ? (
                      <div className="py-40 text-center opacity-20 flex flex-col items-center gap-8 border-4 border-dashed border-white/5 rounded-[5rem]">
                        <Database size={80} />
                        <span className="text-xl font-black uppercase tracking-[0.8em]">Néant Digital</span>
                      </div>
                  ) : filteredTenants.map(t => (
                    <div key={t.T_Id} className="group bg-slate-900/20 border border-white/5 p-12 rounded-[4.5rem] hover:bg-white/5 hover:border-blue-600/40 transition-all duration-700 flex flex-col xl:flex-row items-center justify-between gap-10 shadow-2xl">
                      <div className="flex items-center gap-10 text-left w-full">
                        <div className="w-24 h-24 bg-slate-950 border-2 border-white/5 rounded-[2.5rem] flex items-center justify-center font-black text-4xl text-blue-600 shadow-4xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          {t.T_Name ? t.T_Name[0].toUpperCase() : '?'}
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-black uppercase text-white tracking-tighter italic leading-none m-0">{t.T_Name}</h3>
                          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                            <span className="flex items-center gap-2 bg-black/40 px-5 py-2.5 rounded-xl text-blue-400 border border-white/5"><Globe size={14} /> {t.T_Domain}</span>
                            <span className="flex items-center gap-2 bg-black/40 px-5 py-2.5 rounded-xl border border-white/5"><Terminal size={14} /> {t.T_Plan}</span>
                            <span className={`px-5 py-2.5 rounded-xl border border-white/5 ${t.T_SubscriptionStatus === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                               ● {t.T_SubscriptionStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 w-full xl:w-auto justify-end">
                         <button onClick={() => { setActiveTenant(t); setView("TENANT_EDIT"); }} className="p-7 bg-white/5 rounded-4xl text-slate-600 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer shadow-lg">
                           <Edit3 size={24} />
                         </button>
                         <button onClick={() => handleImpersonate(t.T_Id)} className="bg-blue-600 text-white px-12 py-7 rounded-4xl font-black uppercase text-[12px] italic flex items-center gap-5 hover:bg-white hover:text-black shadow-4xl shadow-blue-900/50 transition-all border-none cursor-pointer active:scale-95">
                            <ExternalLink size={20} /> Incarner
                         </button>
                         <button onClick={() => handleDeleteTenant(t.T_Id)} className="p-7 bg-red-600/10 rounded-4xl text-red-900 hover:text-white hover:bg-red-600 transition-all border-none cursor-pointer">
                           <Trash2 size={24} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- VUE ÉDITION --- */}
          {view === "TENANT_EDIT" && activeTenant && (
            <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-5xl mx-auto text-left">
              <form onSubmit={handleUpdateTenant} className="bg-slate-900/30 border border-white/10 p-20 rounded-[5rem] space-y-16 shadow-4xl backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-600"><Settings2 size={200} /></div>
                
                <h3 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.5em] border-b border-white/10 pb-10 flex items-center gap-5 m-0 italic">
                  <Fingerprint size={24} /> Paramétrage du Nœud territorial
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-4 italic">Raison Sociale</label>
                    <input className="w-full bg-slate-950 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-black text-white italic outline-none focus:border-blue-600 transition-all shadow-inner" 
                      value={activeTenant.T_Name} onChange={e => setActiveTenant({...activeTenant, T_Name: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-4 italic">Offre de Service Matrix</label>
                    <select className="w-full bg-slate-950 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-black text-white italic outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner"
                      value={activeTenant.T_Plan} onChange={e => setActiveTenant({...activeTenant, T_Plan: e.target.value})}>
                      <option value="GROUPE">GROUPE (PROTOCOLE TOTAL)</option>
                      <option value="ELITE">ELITE (50 AGENTS)</option>
                      <option value="ESSAI">ESSAI (VÉRIFICATION)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-4 italic">Statut de Scellage</label>
                    <select className="w-full bg-slate-950 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-black text-white italic outline-none focus:border-emerald-600 appearance-none cursor-pointer shadow-inner"
                      value={activeTenant.T_SubscriptionStatus} onChange={e => setActiveTenant({...activeTenant, T_SubscriptionStatus: e.target.value})}>
                      <option value="ACTIVE">OPÉRATIONNEL (SCELLÉ)</option>
                      <option value="SUSPENDED">SUSPENDU (RESTRICTION)</option>
                      <option value="EXPIRED">EXPIRÉ (FIN DE BAIL)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-4 italic">UUID Système</label>
                    <div className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 text-[11px] font-mono text-slate-700 uppercase tracking-widest shadow-inner overflow-hidden">
                      {activeTenant.T_Id}
                    </div>
                  </div>
                </div>

                <div className="pt-16 flex flex-col md:flex-row gap-8">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-10 rounded-[2.5rem] font-black uppercase text-xs italic flex items-center justify-center gap-5 shadow-4xl hover:bg-white hover:text-black transition-all border-none cursor-pointer active:scale-95">
                    <Save size={24} /> SCELLER LES MODIFICATIONS
                  </button>
                  <button type="button" onClick={() => setView("MATRIX")} className="px-16 bg-white/5 text-slate-500 py-10 rounded-[2.5rem] font-black uppercase text-xs italic hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer">
                    Abandonner
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* FOOTER CLUSTER STATUS */}
        <footer className="mt-auto px-16 py-12 bg-[#0B0F1A] border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-16">
               <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] mb-2 leading-none">Sync Status</span>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[11px] font-black text-emerald-500 uppercase italic tracking-widest">Dakar Hub : Online</span>
                  </div>
               </div>
               <div className="w-px h-12 bg-white/10 hidden md:block" />
               <div className="flex-col text-left hidden md:flex">
                  <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] mb-2 leading-none">Cluster Data</span>
                  <span className="text-[11px] font-black text-white uppercase italic tracking-widest">{tenants.length} Nœuds Scellés</span>
               </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em] italic leading-none m-0">Qualisoft Matrix Engine</p>
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.5em] mt-3 italic leading-none m-0">RD-2026-SOUVERAIN_BUILD</p>
            </div>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.1); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.3); }
      `}</style>
    </div>
  );
}