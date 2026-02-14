'use client';
import React, { useEffect, useState } from 'react';
// 👇 CORRECTION : On pointe vers le bon service
import { matrixApi, TenantDetails } from '@/services/matrix.service';
import { Plus, Globe, Users as UsersIcon, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import DeployTenantModal from '@/components/admin/DeployTenantModal';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      // 👇 UTILISATION DE LA NOUVELLE API
      const data = await matrixApi.getTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur de chargement Matrix:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans italic">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              Supervision <span className="text-blue-600">Matrix</span>
            </h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
              Vue globale des instances déployées
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-3xl font-black uppercase text-xs hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl"
          >
            <Plus size={16} /> Déployer Nouvelle Instance
          </button>
        </div>

        {/* LISTE */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={16} /> Registre Actif
            </h2>
            <button onClick={fetchTenants} className="p-2 bg-slate-50 rounded-full hover:rotate-180 transition-all duration-500">
              <RefreshCw size={16} className="text-slate-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-black uppercase tracking-widest text-xs">Aucune instance détectée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tenants.map((tenant) => (
                <div key={tenant.T_Id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${tenant.T_IsActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <h3 className="font-black text-slate-900 uppercase text-lg italic">{tenant.T_Name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {tenant.T_Domain}.qualisoft.sn • {tenant.T_Plan}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs</p>
                      <p className="text-lg font-black text-slate-900 flex items-center justify-end gap-2">
                        {tenant._count?.T_Users || 0} <UsersIcon size={14} className="text-blue-500" />
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                      {tenant.T_IsActive ? 'ACTIF' : 'SUSPENDU'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <DeployTenantModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTenants();
          }} 
        />
      )}
    </div>
  );
}