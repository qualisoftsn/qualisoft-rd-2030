/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : MATRIX GLOBAL CONTROL (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Supervision de la Fédération Qualisoft (Master Node).
 * DESIGN : Click Up Style, High-Density Matrix, Zero-Scroll Viewport.
 * RÉVISION : 06 Mars 2026 | 21:10 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Server, Activity, Plus, ExternalLink, Search, Loader2, 
  Cpu, Database, Globe, ServerCrash
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

export default function MatrixControl() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { setLogin } = useAuthStore() as any;

  const loadMatrix = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/matrix/deploy');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("RUPTURE KERNEL : Liaison Master-Node dégradée.");
      setTenants([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  const onImpersonate = async (tenantId: string) => {
    const tid = toast.loading("Séquençage du Tunnel d'Incarnation...");
    try {
      const { data } = await apiClient.post(`/admin/matrix/impersonate/${tenantId}`);
      // On met à jour le store avec les credentials du client (Mode Master)
      setLogin({ token: data.access_token, user: data.user, isMaster: true });
      toast.success("Tunnel Ouvert. Redirection...", { id: tid });
      window.location.href = "/dashboard";
    } catch {
      toast.error("SAUT REFUSÉ : Le nœud distant ne répond pas.", { id: tid });
    }
  };

  // ✅ CORRECTION : Appel du composant déclaré plus bas
  if (loading) return <LoadingMatrix label="Synchronisation du Cluster Global..." />;

  const filtered = tenants.filter(t => 
    t.T_Name?.toLowerCase().includes(query.toLowerCase()) ||
    t.T_Domain?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-8 md:p-12 gap-10 font-sans italic selection:bg-blue-600/30 text-white animate-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMMANDER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
            <Cpu size={16} className="animate-spin-slow" /> Global Cluster Surveillance
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Matrix <span className="text-blue-600">Master</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              placeholder="RECHERCHER NŒUD..." 
              className="w-full bg-white/5 border border-white/10 rounded-4xl py-5 pl-16 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-800"
              value={query} onChange={e => setQuery(e.target.value)}
            />
          </div>
          <Link href="/admin/matrix/deploy" className="no-underline">
            <button className="h-full bg-white text-slate-900 px-10 py-5 rounded-4xl font-black uppercase text-[10px] tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white border-none cursor-pointer flex items-center gap-3 active:scale-95 shadow-2xl">
              <Plus size={20} strokeWidth={3} /> Déployer Nœud
            </button>
          </Link>
        </div>
      </header>

      {/* 📜 VIEWPORT : Occupation intégrale de l'espace restant */}
      <div className="flex-1 bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col shadow-inner backdrop-blur-md">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
            {filtered.map(tenant => (
              <div key={tenant.T_Id} className="bg-[#0B0F1A]/80 border border-white/5 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-600/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-8 w-full min-w-0">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-inner">
                    <Server size={32} />
                  </div>
                  <div className="text-left min-w-0 space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter m-0 truncate leading-none">{tenant.T_Name}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 italic">
                        <Activity size={10} className={tenant.T_IsActive ? "text-emerald-500" : "text-rose-500"} /> 
                        {tenant.T_Domain}.qualisoft.sn
                      </span>
                      <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">{tenant.T_Plan}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onImpersonate(tenant.T_Id)}
                  className="w-full md:w-auto bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all border-2 border-blue-600/20 cursor-pointer active:scale-95 shadow-lg"
                >
                  <ExternalLink size={16} /> Saut Dimensionnel
                </button>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all" />
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="xl:col-span-2 py-32 flex flex-col items-center justify-center gap-6 opacity-30 border-2 border-dashed border-white/10 rounded-[4rem]">
                <ServerCrash size={60} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] m-0 italic text-center">Aucun nœud identifié dans ce périmètre</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="shrink-0 flex justify-between items-center opacity-40 px-6">
        <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] italic">
          <span className="flex items-center gap-2 text-blue-500"><Database size={12}/> Cluster: SÉCURISÉ</span>
          <span className="flex items-center gap-2"><Globe size={12}/> Monitoring: ACTIF</span>
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest italic m-0 opacity-50">Qualisoft Master Matrix RD-2030</p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// ✅ COMPOSANT ATOMIQUE : LOADING MATRIX (Inclus pour corriger l'erreur)
function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1.2em] animate-pulse m-0 pl-[1.2em]">
        {label}
      </p>
    </div>
  );
}