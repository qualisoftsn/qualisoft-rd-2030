/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : MatrixCockpitPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance souveraine des nœuds et déploiement (Big Bang).
 * SÉCURITÉ : Accès réservé SUPER_ADMIN | Zéro NextAuth.
 * RÉVISION : 03 Mars 2026 | 19:45 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Globe, Users, Zap, Search, ExternalLink, Activity, 
  Crown, Loader2, RefreshCcw, Building2, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// CORE SYSTEM
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { Tenant, Role } from '@/types/elite-sde';

// COMPONENTS
import ProvisioningModal from '@/components/matrix/ProvisioningModal';

// Extension pour les agrégats Prisma
interface MatrixTenant extends Tenant {
  _count: {
    T_Users: number;
    T_Sites: number;
  };
}

export default function MatrixCockpitPage() {
  const router = useRouter();
  const { setLogin, user } = useAuthStore() as any;
  
  // ÉTATS MATRIX
  const [tenants, setTenants] = useState<MatrixTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProvisioningOpen, setIsProvisioningOpen] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU REGISTRE GLOBAL
   */
  const fetchMatrixData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<MatrixTenant[]>('/admin/matrix/tenants');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("ERREUR DE LIAISON : Le registre master est injoignable.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🎭 PROTOCOLE D'IMPERSONATION (MASCARADE)
   * Prise de contrôle directe d'un nœud client.
   */
  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    const tid = toast.loading(`Initialisation de l'avatar sur ${tenantName}...`);
    try {
      const res = await apiClient.post(`/admin/matrix/tenants/${tenantId}/impersonate`);
      const { access_token, targetUser } = res.data;

      // 🔐 SCELLAGE DU COOKIE (Souveraineté sans NextAuth)
      // On utilise le même nom de cookie que celui attendu par le middleware
      document.cookie = `qualisoft_token=${access_token}; path=/; max-age=3600; Secure; SameSite=Lax`;
      
      // Mise à jour de la session globale
      setLogin({ token: access_token, user: targetUser });

      toast.success(`Accès maître établi sur le nœud : ${tenantName}`, { id: tid });
      
      // Basculement vers le cockpit du client
      router.push('/dashboard');
    } catch (err) {
      toast.error("RUPTURE DE PROTOCOLE : Accès refusé par le Kernel distant.", { id: tid });
    }
  };

  /**
   * 🛡️ VÉRIFICATION D'ACCRÉDITATION
   */
  useEffect(() => {
    if (!user) return;
    if (user.U_Role !== Role.SUPER_ADMIN) {
      toast.error("ACCÈS MATRIX REFUSÉ : Accréditation insuffisante.");
      router.replace('/dashboard');
    } else {
      fetchMatrixData();
    }
  }, [user, router, fetchMatrixData]);

  // Filtrage des flux
  const filteredTenants = tenants.filter(t => 
    t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.T_Domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-8 lg:p-12 italic font-sans text-slate-300">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* --- 🛡️ HEADER MATRIX DE COMMANDEMENT --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-5 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
              <Crown size={16} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Matrix Authority RD-2026</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none m-0">
              Matrix <span className="text-blue-600 not-italic">Cockpit</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              {tenants.length} Nœuds actifs détectés dans l&apos;écosystème
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="RECHERCHER UN NŒUD..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all italic"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsProvisioningOpen(true)}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20 border-none cursor-pointer active:scale-95"
            >
              <Plus size={18} /> Nouveau Nœud
            </button>

            <button 
              onClick={fetchMatrixData}
              disabled={isLoading}
              className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-blue-500 cursor-pointer disabled:opacity-30"
            >
              <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* --- 📊 TENANT GRID (GRILLE DES NŒUDS) --- */}
        {isLoading ? (
          <div className="py-48 flex flex-col items-center justify-center gap-8">
            <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={3} />
            <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.6em] animate-pulse italic">Interrogation du Kernel Master...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTenants.map((tenant) => (
              <div 
                key={tenant.T_Id} 
                className="group relative bg-[#0F172A]/40 border border-white/5 rounded-[3rem] p-10 hover:border-blue-600/40 transition-all duration-500 overflow-hidden backdrop-blur-md"
              >
                {/* Filigrane décoratif */}
                <div className="absolute -right-6 -top-6 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 rotate-12">
                   <Building2 size={200} />
                </div>

                <div className="relative z-10 space-y-8">
                  {/* Status Line */}
                  <div className="flex justify-between items-start">
                    <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      tenant.T_IsActive 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      ● {tenant.T_IsActive ? 'Nœud Actif' : 'Nœud Suspendu'}
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">{tenant.T_Domain}</span>
                  </div>

                  {/* Node Branding */}
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors leading-tight m-0">
                      {tenant.T_Name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={10} className="text-amber-500" /> {tenant.T_Plan} • {tenant.T_SubscriptionStatus}
                    </p>
                  </div>

                  {/* Telemetry Stats */}
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <Users size={16} className="text-slate-600" />
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-300 leading-none">{tenant._count.T_Users}</span>
                         <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Collaborateurs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Globe size={16} className="text-slate-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-300 leading-none">{tenant._count.T_Sites}</span>
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Sites Locaux</span>
                      </div>
                    </div>
                  </div>

                  {/* Souveraineté Actions */}
                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => handleImpersonate(tenant.T_Id, tenant.T_Name)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/30 border-none cursor-pointer"
                    >
                      <Zap size={14} fill="currentColor" /> Mascarade
                    </button>
                    <button className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 text-slate-500 hover:text-white transition-all border-none cursor-pointer">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- 📡 MODAL : BIG BANG PROTOCOL --- */}
        <ProvisioningModal 
          isOpen={isProvisioningOpen} 
          onClose={() => setIsProvisioningOpen(false)} 
          onSuccess={fetchMatrixData} 
        />

        {/* --- 🛸 FOOTER TÉLÉMÉTRIQUE --- */}
        <footer className="pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] m-0">Qualisoft Matrix Global v3.1</p>
             <p className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.2em] m-0">Cluster : Dakar-Main-01</p>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 Sovereign Digital Ecosystem</p>
        </footer>
      </div>
    </div>
  );
}