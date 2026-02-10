"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Building2, Plus, Search, Loader2, ChevronRight, Activity, ShieldCheck, Database, Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { matrixApi } from "@/services/matrix.service";
import { toast } from "sonner";

// --- ARCHITECTURE DE TYPE RÉGALIEN (SCELLÉE) ---
type MatrixPlan = "ESSAI" | "STANDARD" | "PREMIUM" | "ULTIMATE";

interface TenantDetails {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_IsActive: boolean;
  T_Plan: MatrixPlan; // ✅ Résout l'erreur de build TS
  _count: {
    T_Users: number;
    T_Sites?: number;
  };
}

/**
 * 🏛️ REGISTRE SOUVERAIN MATRIX
 * Pilotage global des nœuds Qualisoft Elite RD 2030.
 */
export default function MatrixRegistry() {
  const router = useRouter();
  
  // États strictement typés
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  /**
   * 🏗️ RÉCUPÉRATION DU REGISTRE
   * Utilisation de catch anonyme pour éviter toute variable inutilisée.
   */
  useEffect(() => {
    const fetchRegistry = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await matrixApi.getTenants() as TenantDetails[];
        setTenants(data);
      } catch {
        // ✅ Correction ligne 47 : Suppression de caughtException
        toast.error("Échec de connexion au registre Master.");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistry();
  }, []);

  /**
   * 🔎 FILTRAGE DYNAMIQUE (Mémoire optimisée)
   */
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => 
      tenant.T_Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tenant.T_Domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 italic">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan du Registre Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans italic selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SOUVERAIN */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-blue-500/10">
                <Database className="text-blue-500" size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Supervision Master</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
              Registre <span className="text-blue-600">Matrix</span>
            </h1>
          </div>
          
          <button 
            onClick={() => router.push('/admin/matrix/deploy')}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-3xl font-black uppercase text-[11px] hover:bg-slate-900 transition-all shadow-xl shadow-blue-600/20 border-none cursor-pointer"
          >
            <Plus size={18} /> Initialiser Nouveau Nœud
          </button>
        </div>

        {/* RECHERCHE */}
        <div className="relative mb-8 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Filtrer par organisation ou domaine..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none shadow-2xl rounded-[2.5rem] py-6 pl-16 pr-8 font-bold text-slate-900 outline-none placeholder:text-slate-300 transition-all focus:ring-2 ring-blue-500/20"
          />
        </div>

        {/* TABLEAU DES NŒUDS */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-50">
                <th className="px-10 py-6">Organisation</th>
                <th className="px-10 py-6 text-center">Plan</th>
                <th className="px-10 py-6 text-center">Citoyens</th>
                <th className="px-10 py-6 text-center">Statut</th>
                <th className="px-10 py-6 text-right">Cockpit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.T_Id} className="group hover:bg-blue-50/30 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <Building2 size={24} className="text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 uppercase italic text-lg leading-tight">{tenant.T_Name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tenant.T_Domain}.qualisoft.sn</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* AFFICHAGE DU PLAN */}
                  <td className="px-10 py-8 text-center">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {tenant.T_Plan}
                    </span>
                  </td>

                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-xl">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-600">{tenant._count?.T_Users ?? 0}</span>
                    </div>
                  </td>

                  <td className="px-10 py-8 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <Activity size={10} /> {tenant.T_IsActive ? 'Connecté' : 'Hors-ligne'}
                    </div>
                  </td>

                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => router.push(`/admin/matrix/${tenant.T_Id}`)}
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border-none cursor-pointer group/btn"
                    >
                      <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTenants.length === 0 && (
            <div className="p-20 text-center">
              <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Aucun nœud identifié dans ce secteur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}