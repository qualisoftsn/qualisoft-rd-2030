/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { matrixApi, TenantDetails } from '@/services/matrix.service';
import { 
  Search, Plus, Server, AlertCircle, 
  Loader2, RefreshCw, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';

// 👇 IMPORT DES MODULES QUE NOUS AVONS CRÉÉS
import MatrixHealthMonitor from '@/components/admin/MatrixHealthMonitor';
import DeployTenantModal from '@/components/admin/DeployTenantModal';
import TenantDetailsModal from '@/components/admin/TenantDetailsModal';

export default function MatrixPage() {
  // --- ÉTATS DU COCKPIT ---
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [search, setSearch] = useState('');
  
  // États des Modales (Les fenêtres qui s'ouvrent)
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await matrixApi.getTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      // Gestion fine des erreurs d'accès
      if (err.response?.status === 403) {
        toast.error("ACCÈS REFUSÉ : Accréditation insuffisante.");
      } else {
        toast.error("Erreur de connexion au Neuro-Cortex Matrix");
      }
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchTenants();
  }, []);

  // --- FILTRAGE TEMPS RÉEL ---
  const filteredTenants = tenants.filter(t => 
    t.T_Name.toLowerCase().includes(search.toLowerCase()) ||
    t.T_Domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200 font-sans italic selection:bg-blue-500/30">
      
      {/* 1. LE MONITEUR DE SANTÉ (Stats en haut) */}
      <MatrixHealthMonitor />

      {/* 2. BARRE DE COMMANDES */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-6 animate-in slide-in-from-left duration-500">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Server className="text-blue-500" /> Matrix Control
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 pl-1">
            Supervision des Nœuds & Gestion Souveraine
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barre de Recherche */}
          <div className="relative group flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un nœud..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bouton Rafraîchir */}
          <button 
            onClick={fetchTenants}
            className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Synchroniser les données"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* 🔴 BOUTON CRÉATION (Ouvre DeployTenantModal) */}
          <button 
            onClick={() => setIsDeployOpen(true)}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-wide shadow-lg shadow-blue-900/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 cursor-pointer border-none"
          >
            <Plus size={16} /> Initialiser Nouveau Nœud
          </button>
        </div>
      </div>

      {/* 3. TABLEAU DE BORD (Liste des Tenants) */}
      <div className="bg-slate-900/50 rounded-4xl border border-slate-800 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
        
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center text-slate-600 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Synchronisation Matrix...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-24 flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
            <ShieldCheck size={48} />
            <p className="text-xs font-black uppercase tracking-widest">Aucune organisation détectée.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <th className="p-6 pl-8">Statut</th>
                <th className="p-6">Organisation</th>
                <th className="p-6">Domaine Matrix</th>
                <th className="p-6">Plan</th>
                <th className="p-6 text-center">Utilisateurs</th>
                <th className="p-6 text-right pr-8">Accès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredTenants.map((tenant) => (
                <tr 
                  key={tenant.T_Id} 
                  // ⚡ L'ACTION CLÉ : Au clic, on ouvre les détails
                  onClick={() => setSelectedTenantId(tenant.T_Id)}
                  className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-6 pl-8">
                    <div className="relative flex items-center justify-center w-4 h-4">
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${tenant.T_IsActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${tenant.T_IsActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{tenant.T_Name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">UUID: {tenant.T_Id.substring(0, 8)}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 font-mono group-hover:border-blue-900 transition-colors">
                      {tenant.T_Domain}.qualisoft.sn
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-900/10 px-2 py-1 rounded">{tenant.T_Plan}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{tenant._count?.T_Users || 0}</span>
                  </td>
                  <td className="p-6 text-right pr-8">
                    <button className="p-3 bg-slate-900 rounded-xl text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                        <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- LES MODALES INVISIBLES QUI S'ACTIVENT AU CLIC --- */}
      
      {/* 4. MODALE DE CRÉATION DE TENANT */}
      <DeployTenantModal 
        isOpen={isDeployOpen} 
        onClose={() => setIsDeployOpen(false)} 
        onSuccess={() => {
          setIsDeployOpen(false);
          fetchTenants(); // Rafraîchir la liste après création
        }} 
      />

      {/* 5. MODALE DE DÉTAILS (Gestion des Utilisateurs) */}
      <TenantDetailsModal 
        isOpen={!!selectedTenantId} 
        tenantId={selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
      />

    </div>
  );
}