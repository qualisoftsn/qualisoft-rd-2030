/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Configuration pour Next.js 15+
export const dynamic = 'force-dynamic';

type SovereignView = "MATRIX" | "TENANT_EDIT" | "USER_CRUD";

export default function SovereignDashboard() {
  const router = useRouter();
  const { user, setLogin } = useAuthStore();
  
  // 🟢 PROTECTION HYDRATATION
  const [isMounted, setIsMounted] = useState(false);

  // NAVIGATION SPA
  const [view, setView] = useState<SovereignView>("MATRIX");
  const [activeTenant, setActiveTenant] = useState<any>(null);
  
  // DATA STATES
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { setIsMounted(true); }, []);

  // 📡 CHARGEMENT DES DONNÉES SOUVERAINES (CORRIGÉ)
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/super-admin/tenants");
      
      // Extraction sécurisée : gère { data: [...] } ou [...]
      const extractedData = res.data?.data || res.data || [];
      setTenants(Array.isArray(extractedData) ? extractedData : []);
      
    } catch (err: any) {
      console.error("❌ Erreur Matrix Sync:", err);
      toast.error("Échec de la synchronisation du noyau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (isMounted && user) fetchTenants(); 
  }, [fetchTenants, isMounted, user]);

  // 🚀 ACTION : IMPERSONATION (Connexion en tant que...)
  const handleImpersonate = async (tenantId: string) => {
    const toastId = toast.loading("Transfert d'autorité en cours...");
    try {
      const res = await apiClient.post(`/admin/super-admin/impersonate/${tenantId}`);
      
      // Mise à jour du store global avec le nouveau token du tenant
      setLogin({ 
        token: res.data.access_token, 
        user: res.data.user 
      });
      
      toast.success("Mode Assistance Activé", { id: toastId });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Bascule impossible : Autorité refusée", { id: toastId });
    }
  };

  // ✍️ ACTION : MISE A JOUR TENANT
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;

    try {
      toast.loading("Mise à jour des protocoles...", { id: 'update' });
      await apiClient.patch(`/admin/super-admin/tenants/${activeTenant.T_Id}`, activeTenant);
      
      toast.success("Paramètres mis à jour", { id: 'update' });
      setView("MATRIX");
      fetchTenants();
    } catch (err) {
      toast.error("Erreur de sauvegarde critique", { id: 'update' });
    }
  };

  // 🗑️ ACTION : PURGE TENANT
  const handleDeleteTenant = async (id: string) => {
    if (!confirm("⚠️ ATTENTION : Action irréversible. Purger cette instance ?")) return;
    
    try {
      await apiClient.delete(`/admin/super-admin/tenants/${id}`);
      toast.success("Instance purgée du système");
      fetchTenants();
    } catch (err) {
      toast.error("Suppression impossible : Dépendances actives");
    }
  };

  // Filtrage intelligent (Memoized pour la performance)
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.T_Name?.toLowerCase().includes(search.toLowerCase()) ||
      t.T_Domain?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tenants, search]);

  // BARRIÈRE ANTI-CRASH (Si pas monté ou pas d'user)
  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-[0.5em]">Initialisation du Noyau...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] overflow-hidden">
      {/* SIDEBAR SOUVERAINE */}
      <Sidebar user={user as any} isSuperAdmin={true} />

      <div className="flex-1 flex flex-col ml-72 overflow-y-auto h-screen">
        
        {/* HEADER HUB SOUVERAIN */}
        <header className="h-24 bg-[#0B0F1A]/80 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-30 backdrop-blur-xl">
           <div className="flex items-center gap-6">
              {view !== "MATRIX" && (
                <button onClick={() => setView("MATRIX")} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all group">
                  <ChevronLeft size={20} className="text-blue-500 group-hover:text-white" />
                </button>
              )}
              <div className="flex flex-col">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                    {view === "MATRIX" ? "System Matrix" : `Gestion : ${activeTenant?.T_Name}`}
                  </h2>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
                    Nœud Souverain Qualisoft • Admin ID: {user?.U_Id}
                  </p>
              </div>
           </div>

           <div className="flex gap-4">
              <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                 <Crown size={16} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase text-amber-500 italic">Souveraineté RD-2030</span>
              </div>
           </div>
        </header>

        {/* WORKSPACE */}
        <main className="p-10 italic font-sans">

          {/* --- VUE 1 : LA MATRIX --- */}
          {view === "MATRIX" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-12">
                 <div className="relative group flex-1 max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text" placeholder="Filtrer les instances actives..." 
                      className="w-full bg-[#0F172A] border border-white/5 rounded-4xl py-6 pl-16 pr-8 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500/50 transition-all"
                      value={search} onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <button className="ml-8 bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-6 rounded-4xl font-black uppercase text-[10px] italic shadow-2xl flex items-center gap-3 transition-all">
                    <Plus size={18} /> Créer Tenant
                 </button>
              </div>

              {loading ? (
                <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40} /></div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredTenants.length === 0 ? (
                      <div className="py-40 text-center opacity-20 flex flex-col items-center gap-4">
                        <Database size={60} />
                        <span className="font-black uppercase tracking-widest">Aucune instance détectée</span>
                      </div>
                  ) : filteredTenants.map(t => (
                    <div key={t.T_Id} className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/30 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-10">
                        <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-4xl flex items-center justify-center font-black text-2xl text-blue-500 shadow-inner italic">
                          {t.T_Name ? t.T_Name[0] : '?'}
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase text-white tracking-tighter mb-2">{t.T_Name}</h3>
                          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg"><Globe size={12} /> {t.T_Domain || 'internal'}.qualisoft.sn</span>
                            <span className="text-blue-400">Pack: {t.T_Plan}</span>
                            <span className={t.T_SubscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'}>
                              ● {t.T_SubscriptionStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => { setActiveTenant(t); setView("TENANT_EDIT"); }} className="p-5 bg-white/5 rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                           <Settings2 size={20} />
                         </button>
                         <button onClick={() => handleImpersonate(t.T_Id)} className="bg-blue-600 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] italic flex items-center gap-3 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all">
                            <ExternalLink size={16} /> Entrer
                         </button>
                         <button onClick={() => handleDeleteTenant(t.T_Id)} className="p-5 bg-white/5 rounded-3xl text-slate-800 hover:text-red-500 hover:bg-red-500/10 transition-all">
                           <Trash2 size={20} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- VUE 2 : ÉDITION TENANT --- */}
          {view === "TENANT_EDIT" && activeTenant && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl">
              <form onSubmit={handleUpdateTenant} className="bg-slate-900/40 border border-white/5 p-16 rounded-[4rem] space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Raison Sociale</label>
                    <input className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500" 
                      value={activeTenant.T_Name} onChange={e => setActiveTenant({...activeTenant, T_Name: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Domaine Système</label>
                    <input className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black text-slate-500 italic outline-none" 
                      value={activeTenant.T_Domain} readOnly />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Offre Commerciale</label>
                    <select className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 appearance-none"
                      value={activeTenant.T_Plan} onChange={e => setActiveTenant({...activeTenant, T_Plan: e.target.value})}>
                      <option value="GROUPE">GROUPE (ILLIMITÉ)</option>
                      <option value="ELITE">ELITE (50 PILOTES)</option>
                      <option value="ESSAI">ESSAI (14 JOURS)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">État de l&apos;Instance</label>
                    <select className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 appearance-none"
                      value={activeTenant.T_SubscriptionStatus} onChange={e => setActiveTenant({...activeTenant, T_SubscriptionStatus: e.target.value})}>
                      <option value="ACTIVE">OPÉRATIONNEL (ACTIVE)</option>
                      <option value="SUSPENDED">SUSPENDU</option>
                      <option value="EXPIRED">EXPIRÉ</option>
                    </select>
                  </div>
                </div>

                <div className="pt-12 flex gap-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-7 rounded-4xl font-black uppercase text-xs italic flex items-center justify-center gap-4 shadow-2xl hover:bg-blue-500 transition-all">
                    <Save size={24} /> Valider les protocoles
                  </button>
                  <button type="button" onClick={() => setView("MATRIX")} className="px-12 bg-white/5 text-slate-400 py-7 rounded-4xl font-black uppercase text-xs italic hover:bg-white/10 transition-all">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* FOOTER STATUS */}
        <footer className="mt-auto px-10 py-8 bg-[#0B0F1A] border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-10">
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">Status Cluster</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic flex items-center gap-2">
                    <Activity size={10} /> Dakar-Guediawaye : Synchronisé
                  </span>
               </div>
               <div className="w-px h-10 bg-white/5" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">Instances Réelles</span>
                  <span className="text-[10px] font-black text-white uppercase italic">{tenants.length} Noeuds Actifs</span>
               </div>
            </div>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] italic">Qualisoft Orchestrator v2.6 • Sovereign Engine</p>
        </footer>
      </div>
    </div>
  );
}