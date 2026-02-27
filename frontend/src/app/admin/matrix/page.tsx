/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, TenantDetails } from '@/services/matrix.service';
import { 
  Search, Plus, Server, Loader2, RefreshCw, 
  ChevronRight, Activity, Globe, LayoutDashboard 
} from 'lucide-react';
import { toast } from 'sonner';

// --- ACCÈS SÉCURISÉ QUALISOFT (NO NEXTAUTH) ---
import { useAuth } from '@/core/providers/auth-provider'; 

import MatrixHealthMonitor from '@/components/admin/MatrixHealthMonitor';
import DeployTenantModal from '@/components/admin/DeployTenantModal';
import VitrineManager from '@/components/admin/VitrineManager'; 

export default function MatrixControlPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Hook Matrix
  const [activeTab, setActiveTab] = useState<'NODES' | 'VITRINE'>('NODES');
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [search, setSearch] = useState('');
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await matrixApi.getTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Liaison Matrix interrompue.");
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    if (isAuthenticated) fetchTenants(); 
  }, [isAuthenticated]);

  const filtered = tenants.filter(t => 
    t.T_Name.toLowerCase().includes(search.toLowerCase()) || 
    t.T_Domain.toLowerCase().includes(search.toLowerCase())
  );

  // Protection d'accès Super Admin
  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200 italic font-sans">
      
      {/* 📊 STATS HAUT DE PAGE */}
      <MatrixHealthMonitor />

      {/* 🧭 NAVIGATION SYSTÈME (Switch Nodes / Vitrine) */}
      <div className="flex gap-4 p-1 bg-slate-900 w-fit rounded-2xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('NODES')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'NODES' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <Server size={14} /> Supervision Nœuds
        </button>
        <button 
          onClick={() => setActiveTab('VITRINE')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'VITRINE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <Globe size={14} /> Gestion Vitrine (qualisoft.sn)
        </button>
      </div>

      {activeTab === 'NODES' ? (
        <>
          {/* 🕹️ COMMANDES NODES */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3 italic">
                <Server className="text-blue-500" /> Matrix <span className="text-blue-500 underline">Control</span>
              </h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Supervision des nœuds souverains</p>
            </div>
            <div className="flex gap-3">
              <input 
                placeholder="Rechercher un nœud..." 
                className="bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 text-white"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={() => setIsDeployOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] cursor-pointer border-none shadow-lg hover:bg-blue-500 transition-all">
                <Plus size={16} className="inline mr-2"/> Initialiser Nœud
              </button>
            </div>
          </div>

          {/* 🗂️ LISTE DES TENANTS */}
          <div className="bg-slate-900/40 rounded-[2.5rem] border-2 border-slate-800/50 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Sync Matrix...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/80 text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] border-b border-slate-800">
                    <th className="p-6 pl-10">Organisation</th>
                    <th className="p-6">Domaine</th>
                    <th className="p-6">Plan</th>
                    <th className="p-6 text-right pr-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map((t) => (
                    <tr 
                      key={t.T_Id} 
                      className="group hover:bg-blue-600/5 cursor-pointer transition-colors" 
                      onClick={() => window.location.href = `/admin/matrix/${t.T_Id}`}
                    >
                      <td className="p-6 pl-10 font-black text-white text-sm uppercase">{t.T_Name}</td>
                      <td className="p-6 font-mono text-xs text-slate-500">{t.T_Domain}.qualisoft.sn</td>
                      <td className="p-6"><span className="text-[10px] font-black bg-blue-900/20 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20">{t.T_Plan}</span></td>
                      <td className="p-6 text-right pr-10"><ChevronRight size={18} className="inline text-slate-700 group-hover:text-blue-500 transition-colors" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* 🌐 COMPOSANT GESTION VITRINE */
        <VitrineManager />
      )}

      <DeployTenantModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} onSuccess={fetchTenants} />
    </div>
  );
}