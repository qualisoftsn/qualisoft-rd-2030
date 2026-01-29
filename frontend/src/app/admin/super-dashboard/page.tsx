/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// --- TYPES DE VUES SPA ---
type SovereignView = "MATRIX" | "TENANT_EDIT" | "USER_CRUD";

export default function SovereignDashboard() {
  const router = useRouter();
  const { user, setLogin } = useAuthStore();
  
  // States de navigation SPA
  const [view, setView] = useState<SovereignView>("MATRIX");
  const [activeTenant, setActiveTenant] = useState<any>(null);
  
  // States de données
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 📡 CHARGEMENT DES DONNÉES SOUVERAINES
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/super-admin/tenants");
      setTenants(res.data || []);
    } catch (err) {
      toast.error("Échec de synchronisation au Noyau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // 🚀 ACTION : IMPERSONATION (Bascule contextuelle)
  const handleImpersonate = async (tenantId: string) => {
    try {
      toast.loading("Transfert d'autorité...", { id: 'auth' });
      const res = await apiClient.post(`/admin/super-admin/impersonate/${tenantId}`);
      setLogin({ token: res.data.access_token, user: res.data.user });
      toast.success("Mode Assistance Activé", { id: 'auth' });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Bascule impossible");
    }
  };

  // ✍️ ACTION : CRUD - UPDATE TENANT
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/admin/super-admin/tenants/${activeTenant.T_Id}`, activeTenant);
      toast.success("Paramètres mis à jour");
      setView("MATRIX");
      fetchTenants();
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    }
  };

  // 🗑️ ACTION : CRUD - DELETE TENANT
  const handleDeleteTenant = async (id: string) => {
    if (!confirm("⚠️ Action irréversible : supprimer cette instance et ses données ?")) return;
    try {
      await apiClient.delete(`/admin/super-admin/tenants/${id}`);
      toast.success("Instance purgée");
      fetchTenants();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] overflow-hidden">
      {/* 1. SIDEBAR (Immuable) */}
      <Sidebar user={user as any} isSuperAdmin={true} />

      <div className="flex-1 flex flex-col ml-72 overflow-y-auto">
        
        {/* 2. HEADER HUB SOUVERAIN (SPA Navigation) */}
        <div className="h-20 bg-[#0B0F1A] border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-30 backdrop-blur-xl">
           <div className="flex items-center gap-6">
              {view !== "MATRIX" && (
                <button 
                  onClick={() => setView("MATRIX")}
                  className="p-3 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all group"
                >
                  <ChevronLeft size={20} className="text-blue-500 group-hover:text-white" />
                </button>
              )}
              <div className="flex flex-col text-left">
                 <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    {view === "MATRIX" ? "System Matrix" : `Gestion : ${activeTenant?.T_Name}`}
                 </h2>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
                    Nœud Souverain Qualisoft • ID: {user?.U_Id}
                 </p>
              </div>
           </div>

           <div className="flex gap-4">
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                 <Crown size={14} className="text-amber-500" />
                 <span className="text-[9px] font-black uppercase text-amber-500 italic">Souveraineté Totale</span>
              </div>
           </div>
        </div>

        {/* 3. WORKSPACE (Switching Views) */}
        <main className="p-10 italic font-sans text-left">

          {/* --- VUE 1 : LA MATRIX (LISTE) --- */}
          {view === "MATRIX" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-10">
                 <div className="relative group flex-1 max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" placeholder="Filtrer les instances réelles..." 
                      className="w-full bg-[#0F172A] border border-white/5 rounded-4xl py-5 pl-16 pr-8 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500/50"
                      value={search} onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <button className="ml-6 bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-4xl font-black uppercase text-[10px] italic shadow-2xl flex items-center gap-3">
                    <Plus size={16} /> Créer Instance
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tenants.length === 0 ? (
                   <div className="py-40 text-center opacity-20"><Database size={60} className="mx-auto mb-4" /> NO DATA FOUND</div>
                ) : tenants.filter(t => t.T_Name.toLowerCase().includes(search.toLowerCase())).map(t => (
                  <div key={t.T_Id} className="group bg-white/2 border border-white/5 p-8 rounded-[3rem] hover:border-blue-500/30 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center font-black text-xl text-blue-500">{t.T_Name[0]}</div>
                      <div>
                        <h3 className="text-lg font-black uppercase text-white tracking-tighter leading-none mb-2">{t.T_Name}</h3>
                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                          <span className="flex items-center gap-1"><Globe size={10} /> {t.T_Domain}.sn</span>
                          <span className="text-blue-500">Plan: {t.T_Plan}</span>
                          <span className={t.T_SubscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'}>Status: {t.T_SubscriptionStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => { setActiveTenant(t); setView("TENANT_EDIT"); }} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"><Settings2 size={18} /></button>
                       <button onClick={() => handleImpersonate(t.T_Id)} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[9px] italic flex items-center gap-2 hover:bg-blue-500 shadow-xl shadow-blue-900/40">
                          <ExternalLink size={14} /> Accéder
                       </button>
                       <button onClick={() => handleDeleteTenant(t.T_Id)} className="p-4 bg-white/5 rounded-2xl text-slate-700 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VUE 2 : ÉDITION TENANT (CRUD ACTIF) --- */}
          {view === "TENANT_EDIT" && activeTenant && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl">
              <form onSubmit={handleUpdateTenant} className="bg-white/2 border border-white/5 p-12 rounded-[4rem] space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Nom de l&apos;Organisation</label>
                    <input className="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-5 text-sm font-black text-white italic" 
                      value={activeTenant.T_Name} onChange={e => setActiveTenant({...activeTenant, T_Name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Plan d&apos;Abonnement</label>
                    <select className="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-5 text-sm font-black text-white italic outline-none"
                      value={activeTenant.T_Plan} onChange={e => setActiveTenant({...activeTenant, T_Plan: e.target.value})}>
                      <option value="GROUPE">GROUPE (ILLIMITÉ)</option>
                      <option value="ELITE">ELITE (50 PILOTES)</option>
                      <option value="ESSAI">ESSAI (14 JOURS)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Status Instance</label>
                    <select className="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-5 text-sm font-black text-white italic outline-none"
                      value={activeTenant.T_SubscriptionStatus} onChange={e => setActiveTenant({...activeTenant, T_SubscriptionStatus: e.target.value})}>
                      <option value="ACTIVE text-emerald-500">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDUE</option>
                      <option value="EXPIRED">EXPIREE</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Date d&apos;expiration</label>
                    <input type="date" className="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-5 text-sm font-black text-white italic" 
                      value={activeTenant.T_ExpiryDate?.split('T')[0]} onChange={e => setActiveTenant({...activeTenant, T_ExpiryDate: e.target.value})} />
                  </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-xs italic flex items-center justify-center gap-3 shadow-2xl">
                    <Save size={20} /> Enregistrer les modifications
                  </button>
                  <button type="button" onClick={() => setView("MATRIX")} className="px-10 bg-white/5 text-slate-400 py-6 rounded-3xl font-black uppercase text-xs italic">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* 4. FOOTER STATUS (SMI REAL-TIME) */}
        <footer className="mt-auto p-10 bg-[#0F172A]/50 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Connectivité Base</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic">Cluster Guediawaye : ACTIVE</span>
               </div>
               <div className="w-px h-8 bg-white/5" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Total Instances</span>
                  <span className="text-[10px] font-black text-white uppercase italic">{tenants.length} Tenants</span>
               </div>
            </div>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Qualisoft Orchestrator v2.4 • RD-2030</p>
        </footer>
      </div>
    </div>
  );
}