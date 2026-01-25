'use client';
import React, { useEffect, useState } from 'react';
import { adminService, TenantStats } from '@/services/adminService';
import { Plus, Globe, Users as UsersIcon, RefreshCw } from 'lucide-react';
import DeployTenantModal from '@/components/admin/DeployTenantModal';

export default function MonitoringPage() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTenants();
      setTenants(data);
    } catch (err) {
      console.error("Erreur Monitoring:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Monitoring Système</h1>
          <p className="text-slate-400 mt-2 font-medium">Vue globale sur les instances Qualisoft Elite actives.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchTenants}
            className="p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all text-slate-400"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <Plus className="h-6 w-6" /> Déployer une Instance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Instances</p>
            <p className="text-4xl font-black">{tenants.length}</p>
         </div>
         <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Utilisateurs Globaux</p>
            <p className="text-4xl font-black text-blue-500">
               {tenants.reduce((acc, t) => acc + t._count.T_Users, 0)}
            </p>
         </div>
         <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Status Infrastructure</p>
            <p className="text-4xl font-black text-emerald-500">OPTIMAL</p>
         </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            <tr>
              <th className="px-8 py-6">Organisation</th>
              <th className="px-8 py-6">Environnement</th>
              <th className="px-8 py-6">Plan Actuel</th>
              <th className="px-8 py-6">Activité</th>
              <th className="px-8 py-6">Contrat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-medium">
            {loading ? (
              <tr><td colSpan={5} className="p-32 text-center text-slate-600 font-bold italic tracking-widest">Initialisation de la matrice...</td></tr>
            ) : tenants.map((tenant) => (
              <tr key={tenant.T_Id} className="hover:bg-blue-600/5 transition-all group">
                <td className="px-8 py-8">
                  <p className="text-xl font-black group-hover:text-blue-400 transition-colors">{tenant.T_Name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{tenant.T_Id}</p>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="h-4 w-4 text-blue-500/50" />
                    <span className="text-sm lowercase font-mono">{tenant.T_Domain}.qualisoft.sn</span>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <span className="px-4 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black tracking-widest uppercase">
                    {tenant.T_Plan}
                  </span>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs">
                       <UsersIcon className="h-3 w-3 text-slate-500" /> {tenant._count.T_Users}
                    </div>
                    <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${tenant.T_SubscriptionStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                  </div>
                </td>
                <td className="px-8 py-8">
                  <p className="text-sm text-slate-400 font-bold">
                    {tenant.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate).toLocaleDateString() : 'Illimité'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <DeployTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchTenants} />}
    </div>
  );
}