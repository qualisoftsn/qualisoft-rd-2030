/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : SUPER-DASHBOARD MATRIX SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Console de commandement global pour l'Architecte Master.
 * FONCTIONS : Pilotage des Tenants, Impersonation Master, Purge Kernel.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:40 GMT
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/core/api/api-client";
import Sidebar from "@/app/dashboard/sidebar";
import { 
  Database, Globe, ShieldCheck, Zap, Search, 
  Crown, Terminal, Clock, ExternalLink, 
  Activity, Settings2, Plus, Loader2, 
  ChevronLeft, Save, Trash2, UserPlus, 
  RefreshCcw, Eye, Edit3
} from "lucide-react";
import { toast } from "sonner"; // ✅ Harmonisation avec Sonner
import { useRouter } from "next/navigation";
import { Role, Tenant } from "@/types/elite-sde";

// Optimisation Next.js pour dashboard temps réel
export const dynamic = 'force-dynamic';

type SovereignView = "MATRIX" | "TENANT_EDIT" | "USER_CRUD";

export default function SovereignDashboard() {
  const router = useRouter();
  const { user, setLogin, isAuthenticated } = useAuthStore() as any;
  
  const [hasMounted, setHasMounted] = useState(false);
  const [view, setView] = useState<SovereignView>("MATRIX");
  const [activeTenant, setActiveTenant] = useState<Tenant | any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fix Hydratation : Montage sécurisé
  useEffect(() => { 
    setHasMounted(true); 
  }, []);

  /**
   * 📡 SYNCHRONISATION MATRIX
   * Récupère l'état de santé et les données de tous les tenants.
   */
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/super-admin/tenants");
      
      // Extraction sécurisée selon la structure du Kernel NestJS
      const extractedData = res.data?.data || res.data || [];
      setTenants(Array.isArray(extractedData) ? extractedData : []);
    } catch (err: any) {
      toast.error("Échec de synchronisation avec le Noyau Matrix");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (hasMounted && isAuthenticated && user?.U_Role === Role.SUPER_ADMIN) {
      fetchTenants(); 
    }
  }, [fetchTenants, hasMounted, isAuthenticated, user]);

  /**
   * 🎭 ACTION : TUNNEL D'INCARNATION
   * Permet à l'architecte de basculer dans une instance client pour support technique.
   */
  const handleImpersonate = async (tenantId: string) => {
    const tid = toast.loading("Ouverture du Tunnel d'Incarnation...");
    try {
      const res = await apiClient.post(`/admin/super-admin/impersonate/${tenantId}`);
      
      // Injection du nouveau token et identité dans le store global
      setLogin(res.data.access_token, res.data.user);
      
      toast.success("Mode Assistance Master Activé", { id: tid });
      
      // Redirection vers le cockpit local du client
      router.push("/dashboard");
    } catch (err) {
      toast.error("Bascule impossible : Accès refusé par le nœud", { id: tid });
    }
  };

  /**
   * ✍️ ACTION : MISE À JOUR SOUVERAINE
   */
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;

    const tid = toast.loading("Scellage des nouveaux protocoles...");
    try {
      await apiClient.patch(`/admin/super-admin/tenants/${activeTenant.T_Id}`, activeTenant);
      toast.success("Registre Matrix mis à jour", { id: tid });
      setView("MATRIX");
      fetchTenants();
    } catch (err) {
      toast.error("Rejet du Kernel : Données invalides", { id: tid });
    }
  };

  /**
   * 🗑️ ACTION : PURGE ATOMIQUE
   */
  const handleDeleteTenant = async (id: string) => {
    if (!confirm("⚠️ ATTENTION : Suppression irréversible. Purger l'instance ?")) return;
    
    const tid = toast.loading("Purge du système en cours...");
    try {
      await apiClient.delete(`/admin/super-admin/tenants/${id}`);
      toast.success("Instance purgée avec succès", { id: tid });
      fetchTenants();
    } catch (err) {
      toast.error("Suppression impossible : Dépendances SMI actives", { id: tid });
    }
  };

  // Filtrage temps réel memoïsé
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.T_Name?.toLowerCase().includes(search.toLowerCase()) ||
      t.T_Domain?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tenants, search]);

  // 🛡️ BARRIÈRE DE SÉCURITÉ (Hydratation + Rôle)
  if (!hasMounted || !isAuthenticated) return null;
  if (user?.U_Role !== Role.SUPER_ADMIN) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-6">
        <ShieldCheck className="text-red-500 animate-pulse" size={60} />
        <p className="text-red-500 font-black uppercase tracking-widest italic">Accès Matrix Refusé</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0F1A] overflow-hidden italic selection:bg-blue-600/30">
      
      {/* 🛠️ SIDEBAR GAUCHE (Structurelle) */}
      <Sidebar user={user} isSuperAdmin={true} />

      <div className="flex-1 flex flex-col ml-72 min-w-0">
        
        {/* HEADER HUB SOUVERAIN */}
        <header className="h-24 bg-[#0B0F1A]/80 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-30 backdrop-blur-xl">
           <div className="flex items-center gap-6">
              {view !== "MATRIX" && (
                <button onClick={() => setView("MATRIX")} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all group border-none cursor-pointer">
                  <ChevronLeft size={20} className="text-blue-500 group-hover:text-white" />
                </button>
              )}
              <div className="text-left">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                    {view === "MATRIX" ? "System Matrix" : `Édition : ${activeTenant?.T_Name}`}
                  </h2>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] italic mt-2">
                    Qualisoft Global Cluster • Root Access
                  </p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                 <Crown size={16} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase text-amber-500 italic tracking-widest">Architecte Master</span>
              </div>
           </div>
        </header>

        {/* WORKSPACE DYNAMIQUE */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">

          {/* --- VUE 1 : LA MATRIX (Listing) --- */}
          {view === "MATRIX" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                 <div className="relative group flex-1 max-w-2xl w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="text" placeholder="Filtrer les instances actives par nom ou domaine..." 
                      className="w-full bg-white/5 border border-white/5 rounded-4xl py-6 pl-16 pr-8 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                      value={search} onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <Link href="/admin/matrix/deploy" className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-6 rounded-4xl font-black uppercase text-[11px] italic shadow-2xl flex items-center gap-4 transition-all active:scale-95 no-underline">
                    <Plus size={18} /> Déployer Nouveau Nœud
                 </Link>
              </div>

              {loading ? (
                <div className="py-40 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Analyse du Cluster...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 pb-20">
                  {filteredTenants.length === 0 ? (
                      <div className="py-40 text-center opacity-20 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-[4rem]">
                        <Database size={60} />
                        <span className="font-black uppercase tracking-widest">Néant Digital : Aucune instance</span>
                      </div>
                  ) : filteredTenants.map(t => (
                    <div key={t.T_Id} className="group bg-slate-900/30 border border-white/5 p-10 rounded-[3.5rem] hover:bg-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col lg:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-8 text-left w-full">
                        <div className="w-20 h-20 bg-slate-950 border border-white/10 rounded-4xl flex items-center justify-center font-black text-3xl text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                          {t.T_Name ? t.T_Name[0].toUpperCase() : '?'}
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black uppercase text-white tracking-tighter italic leading-none">{t.T_Name}</h3>
                          <div className="flex flex-wrap items-center gap-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-blue-400 border border-white/5"><Globe size={12} /> {t.T_Domain}</span>
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><Activity size={12} /> {t.T_Plan}</span>
                            <span className={`px-4 py-2 rounded-xl border border-white/5 ${t.T_SubscriptionStatus === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/5' : 'text-red-500 bg-red-500/5'}`}>
                               ● {t.T_SubscriptionStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                         <button onClick={() => { setActiveTenant(t); setView("TENANT_EDIT"); }} className="p-6 bg-white/5 rounded-3xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer">
                           <Edit3 size={20} />
                         </button>
                         <button onClick={() => handleImpersonate(t.T_Id)} className="bg-blue-600 text-white px-10 py-6 rounded-3xl font-black uppercase text-[11px] italic flex items-center gap-4 hover:bg-white hover:text-black shadow-3xl shadow-blue-900/40 transition-all border-none cursor-pointer">
                            <ExternalLink size={18} /> Incarner
                         </button>
                         <button onClick={() => handleDeleteTenant(t.T_Id)} className="p-6 bg-red-500/5 rounded-3xl text-red-900 hover:text-white hover:bg-red-600 transition-all border-none cursor-pointer">
                           <Trash2 size={20} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- VUE 2 : ÉDITION TENANT (DÉTAILS) --- */}
          {view === "TENANT_EDIT" && activeTenant && (
            <div className="animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto text-left">
              <form onSubmit={handleUpdateTenant} className="bg-slate-900/40 border border-white/5 p-16 rounded-[4rem] space-y-12 shadow-3xl backdrop-blur-3xl">
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] border-b border-white/5 pb-8 flex items-center gap-4">
                  <Settings2 size={18} /> Paramétrage du Nœud territorial
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 italic">Raison Sociale</label>
                    <input className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 transition-all" 
                      value={activeTenant.T_Name} onChange={e => setActiveTenant({...activeTenant, T_Name: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 italic">Offre de Service</label>
                    <select className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 appearance-none cursor-pointer"
                      value={activeTenant.T_Plan} onChange={e => setActiveTenant({...activeTenant, T_Plan: e.target.value})}>
                      <option value="GROUPE">GROUPE (ILLIMITÉ)</option>
                      <option value="ELITE">ELITE (50 PILOTES)</option>
                      <option value="ESSAI">ESSAI (14 JOURS)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 italic">Statut de Scellage</label>
                    <select className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-6 text-sm font-black text-white italic outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                      value={activeTenant.T_SubscriptionStatus} onChange={e => setActiveTenant({...activeTenant, T_SubscriptionStatus: e.target.value})}>
                      <option value="ACTIVE">OPÉRATIONNEL (ACTIVE)</option>
                      <option value="SUSPENDED">SUSPENDU (DÉFAUT PAIEMENT)</option>
                      <option value="EXPIRED">EXPIRÉ (FIN ESSAI)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 italic">ID Système</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                      {activeTenant.T_Id}
                    </div>
                  </div>
                </div>

                <div className="pt-12 flex flex-col md:flex-row gap-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-8 rounded-4xl font-black uppercase text-xs italic flex items-center justify-center gap-4 shadow-3xl hover:bg-white hover:text-black transition-all border-none cursor-pointer">
                    <Save size={20} /> Sceller les Modifications
                  </button>
                  <button type="button" onClick={() => setView("MATRIX")} className="px-12 bg-white/5 text-slate-400 py-8 rounded-4xl font-black uppercase text-xs italic hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer">
                    Abandonner
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* FOOTER SYSTEM STATUS */}
        <footer className="mt-auto px-12 py-10 bg-[#0B0F1A] border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-12">
               <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-1 leading-none">Status Cluster</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Synchronisation Dakar OK
                  </span>
               </div>
               <div className="w-px h-10 bg-white/5 hidden md:block" />
               <div className="flex-col text-left hidden md:flex">
                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-1 leading-none">Nœuds Réels</span>
                  <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{tenants.length} Instances Scellées</span>
               </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.6em] italic leading-none">Qualisoft Elite Matrix Engine v1.5</p>
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em] mt-2 italic leading-none">Build RD-2030-SOUVERAIN</p>
            </div>
        </footer>
      </div>
    </div>
  );
}

// Composant Link interne pour la navigation
function Link({ href, className, children }: any) {
  return <a href={href} className={className}>{children}</a>;
}