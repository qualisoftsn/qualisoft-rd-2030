/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CLOSING FINANCIER (ELITE-SDE)
 * RÔLE : Validation des transactions et activation des licences Matrix
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, KeyboardEvent } from 'react';
import { 
  Check, Ban, Loader2, ShieldCheck, RefreshCcw, 
  Wallet, Banknote, Smartphone, ExternalLink, Activity, AlertCircle, Clock, AlertTriangle
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TransactionMethod = 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT' | 'AUTRE';
export type TenantAction = 'ACTIVATE' | 'SUSPEND';

export interface Transaction {
  TX_Id: string;
  TX_Amount: number;
  TX_PaymentMethod: TransactionMethod;
  TX_ProofUrl?: string;
  TX_Reference?: string;
  TX_Status?: string;
  TX_CreatedAt?: string;
}

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_CeoName?: string;
  T_Plan: string;
  T_Status?: string;
  T_Transactions?: Transaction[];
  T_Email?: string;
  T_Phone?: string;
}

export interface TenantRowProps {
  tenant: Tenant;
  actioning: string | null;
  onValidate: (tenantId: string, action: TenantAction) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>, tenantId: string) => void;
}

export interface LoadingMatrixProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: LoadingMatrixProps) {
  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
      <p className="text-blue-400 font-black uppercase italic text-[9px] md:text-[10px] tracking-widest animate-pulse m-0">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TENANT ROW
// ============================================================================

function TenantRow({ tenant, actioning, onValidate, onKeyDown }: TenantRowProps) {
  const transaction = tenant.T_Transactions?.[0];
  const amount = transaction?.TX_Amount || 0;
  const paymentMethod = transaction?.TX_PaymentMethod || 'VIREMENT';
  const proofUrl = transaction?.TX_ProofUrl;

  const handleActivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValidate(tenant.T_Id, 'ACTIVATE');
  };

  const handleSuspendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValidate(tenant.T_Id, 'SUSPEND');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    onKeyDown(e, tenant.T_Id);
  };

  return (
    <tr 
      className="group hover:bg-white/5 transition-all duration-300 italic focus-within:bg-white/5 focus:outline-none"
      role="row"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Transaction pour ${tenant.T_Name}`}
    >
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <p className="text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-tighter m-0 group-hover:text-blue-400 transition-colors leading-none truncate">
          {tenant.T_Name}
        </p>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase mt-1 md:mt-2 m-0 tracking-widest truncate">
          {tenant.T_CeoName || 'N/A'}
        </p>
      </td>
      <td className="p-4 md:p-6 lg:p-8 text-center" role="gridcell">
        <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black tracking-widest uppercase inline-block">
          {tenant.T_Plan}
        </span>
      </td>
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="text-left min-w-0">
              <p className="text-lg md:text-xl lg:text-2xl font-black text-white m-0 italic truncate">
                {amount.toLocaleString('fr-SN')} 
                <span className="text-[10px] md:text-xs text-blue-400 uppercase ml-1">XOF</span>
              </p>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 md:mt-1 m-0 italic truncate">
                {paymentMethod}
              </p>
           </div>
           {proofUrl && (
             <a 
               href={proofUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-2 md:p-3 lg:p-4 bg-emerald-500/10 text-emerald-400 rounded-lg md:rounded-xl lg:rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
               aria-label={`Voir la preuve de paiement pour ${tenant.T_Name}`}
               title="Voir la preuve"
             >
               <ExternalLink size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
             </a>
           )}
        </div>
      </td>
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <div className="flex items-center justify-center gap-3 md:gap-4">
           <button 
             type="button"
             disabled={actioning === tenant.T_Id}
             onClick={handleActivateClick}
             className={cn(
               "bg-emerald-600 text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-lg md:rounded-xl lg:rounded-2xl font-black text-[8px] md:text-[9px] tracking-widest uppercase hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer active:scale-95 shadow-xl shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center gap-1.5 md:gap-2",
               actioning === tenant.T_Id && "opacity-50 cursor-not-allowed"
             )}
             aria-label={`Activer la licence pour ${tenant.T_Name}`}
             aria-busy={actioning === tenant.T_Id}
           >
             {actioning === tenant.T_Id ? (
               <Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" />
             ) : (
               <><Check size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 inline" aria-hidden="true" /> <span className="hidden lg:inline">Activer</span></>
             )}
           </button>
           <button 
             type="button"
             disabled={actioning === tenant.T_Id}
             onClick={handleSuspendClick}
             className={cn(
               "p-2 md:p-3 lg:p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg md:rounded-xl lg:rounded-2xl transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400",
               actioning === tenant.T_Id && "opacity-50 cursor-not-allowed"
             )}
             aria-label={`Suspendre la licence pour ${tenant.T_Name}`}
             aria-busy={actioning === tenant.T_Id}
           >
             <Ban size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
           </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GlobalClosing() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchRegistry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant[]>('/admin/transactions/pending');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement transactions:', error);
      toast.error("Rupture de flux financier : Liaison Kernel dégradée.");
      setTenants([]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchRegistry(); }, [fetchRegistry]);

  const handleValidation = async (tenantId: string, action: TenantAction) => {
    setActioning(tenantId);
    const toastId = toast.loading(`Exécution du protocole ${action}...`);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("REGISTRE SCELLÉ : Licence mise à jour.", { id: toastId });
      fetchRegistry();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "REJET KERNEL : Opération déclinée.", { id: toastId });
    } finally { 
      setActioning(null); 
    }
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, tenantId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Default action could be activate
      handleValidation(tenantId, 'ACTIVATE');
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingMatrix label="Calcul du Grand Livre..." />;
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 gap-6 md:gap-8 lg:gap-10 font-sans italic text-white animate-in zoom-in-95 duration-500">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 lg:gap-8 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400" aria-hidden="true" />
            <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest">Qualisoft Sovereign CRM</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl lg:text-8xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Closing <span className="text-blue-400">Financier</span>
          </h1>
        </div>
        <button 
          type="button"
          onClick={fetchRegistry} 
          disabled={loading}
          className={cn(
            "bg-white/5 border border-white/10 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 md:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 md:gap-3 lg:gap-4 cursor-pointer active:scale-95 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400",
            loading && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Actualiser la liste des transactions"
          aria-busy={loading}
        >
          <RefreshCcw size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5", loading ? 'animate-spin' : '')} aria-hidden="true" />
          <span className="hidden sm:inline">Actualiser Matrix</span>
        </button>
      </header>

      {/* 📊 TRANSACTIONS TABLE */}
      <article 
        className="flex-1 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] overflow-hidden flex flex-col shadow-inner backdrop-blur-md"
        aria-labelledby="transactions-title"
      >
        <div className="flex-1 overflow-auto custom-scrollbar" role="region" aria-label="Tableau des transactions en attente">
          <table className="w-full text-left border-collapse min-w-full md:min-w-[250px]" role="table">
            <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-20 border-b border-white/5">
              <tr role="row">
                <th className="p-4 md:p-6 lg:p-8 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic" scope="col">Organisation</th>
                <th className="p-4 md:p-6 lg:p-8 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic text-center" scope="col">Plan</th>
                <th className="p-4 md:p-6 lg:p-8 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic" scope="col">Flux & Preuve</th>
                <th className="p-4 md:p-6 lg:p-8 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic text-center" scope="col">Protocole</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5" role="rowgroup">
              {tenants.length > 0 ? tenants.map((t) => (
                <TenantRow 
                  key={t.T_Id} 
                  tenant={t} 
                  actioning={actioning}
                  onValidate={handleValidation}
                  onKeyDown={handleRowKeyDown}
                />
              )) : (
                <tr role="row">
                  <td colSpan={4} className="p-16 md:p-20 lg:p-24 md:p-32 text-center opacity-30" role="status">
                    <div className="flex flex-col items-center gap-4 md:gap-6">
                       <Clock size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
                       <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest m-0 italic">Aucune transaction en attente de scellage</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* FOOTER */}
      <footer className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3 opacity-30 px-4 md:px-6" role="contentinfo">
        <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic leading-none">
          <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400" aria-hidden="true" /> 
          Flux Financiers Scellés • SDE-RD-2026
        </div>
        <div className="text-[8px] md:text-[9px] font-black italic uppercase tracking-widest">Souveraineté Closing Qualisoft</div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}