/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : AdminPaymentsPage.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Console de Closing Financier & Activation de Licences.
 * FIX : Dark Mode Matrix, Zéro Scroll Global (ClickUp UI).
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, Clock, Smartphone, CreditCard, Banknote, 
  Loader2, ShieldCheck, RefreshCcw, User, Phone, Wallet,
  ExternalLink, Ban, Check, AlertCircle
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { 
  Tenant, Transaction, SubscriptionStatus, PaymentMethod, Plan 
} from '@/types/elite-sde';
import { toast } from 'sonner';

interface TenantWithTransactions extends Tenant {
  T_Transactions: Transaction[];
}

export default function AdminPaymentsPage() {
  const [tenants, setTenants] = useState<TenantWithTransactions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<TenantWithTransactions[]>('/admin/transactions/pending');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("ÉCHEC SYNCHRO : Impossible de joindre le registre financier.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAction = async (tenantId: string, action: 'ACTIVATE' | 'SUSPEND' | 'REJECT') => {
    const tid = toast.loading(`Protocole ${action} en cours...`);
    setIsProcessing(tenantId);
    
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("REGISTRE SCELLÉ : La licence a été mise à jour.", { id: tid });
      fetchData();
    } catch (err) {
      toast.error("REJET KERNEL : L'opération a été déclinée par le nœud.", { id: tid });
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="h-full flex flex-col p-4 md:p-8 lg:p-12 font-sans italic selection:bg-blue-600/30 text-white">
      <div className="flex flex-col h-full max-w-400 mx-auto w-full animate-in fade-in duration-700">
        
        {/* --- 🛡️ HEADER CRM MATRIX --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Qualisoft Sovereign CRM</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter italic uppercase leading-none m-0">
              Console <span className="text-blue-600 not-italic">Closing</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] m-0">Pilotage des flux financiers & Activation des Nœuds</p>
          </div>
          
          <button 
            onClick={fetchData} 
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] text-slate-300 hover:bg-white hover:text-slate-900 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            Actualiser Matrix
          </button>
        </header>

        {/* --- 📊 REGISTRE DES TRANSACTIONS --- */}
        <div className="flex-1 mt-8 rounded-4xl md:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/5 flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={3} />
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.6em] animate-pulse italic m-0">Lecture du grand livre...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-225">
                <thead className="sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-md z-10">
                  <tr className="border-b border-white/5">
                    <th className="p-6 md:p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap">Organisation</th>
                    <th className="p-6 md:p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap">Offre & Statut</th>
                    <th className="p-6 md:p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap">Flux Financier</th>
                    <th className="p-6 md:p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-center whitespace-nowrap">Preuve</th>
                    <th className="p-6 md:p-8 text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic whitespace-nowrap">Protocole</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tenants.map((tenant) => {
                    const lastTx = tenant.T_Transactions?.[0];
                    return (
                      <tr key={tenant.T_Id} className="group hover:bg-white/5 transition-all duration-300">
                        <td className="p-6 md:p-8">
                          <div className="flex flex-col text-left">
                            <span className="font-black text-white uppercase tracking-tighter text-xl md:text-2xl group-hover:text-blue-500 transition-colors leading-none mb-2 italic">
                              {tenant.T_Name}
                            </span>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500">
                              <span className="flex items-center gap-2 text-[9px] font-black italic uppercase tracking-widest"><User size={12} className="text-blue-500"/> {tenant.T_CeoName || 'N/A'}</span>
                              <span className="flex items-center gap-2 text-[9px] font-black italic uppercase tracking-widest"><Phone size={12} className="text-blue-500"/> {tenant.T_Phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-6 md:p-8">
                          <div className="flex flex-col text-left gap-2">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                              <Crown size={12} /> {tenant.T_Plan}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit border ${
                              tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                              ● {tenant.T_SubscriptionStatus}
                            </span>
                          </div>
                        </td>

                        <td className="p-6 md:p-8">
                          {lastTx ? (
                            <div className="flex flex-col text-left">
                              <span className="font-black text-white text-xl tracking-tighter italic m-0">
                                {lastTx.TX_Amount.toLocaleString()} <span className="text-blue-500 text-[10px] not-italic">XOF</span>
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="p-1.5 bg-white/5 rounded-md text-slate-400">
                                  {lastTx.TX_PaymentMethod === PaymentMethod.WAVE ? <Smartphone size={12}/> : <Banknote size={12}/>}
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  {lastTx.TX_PaymentMethod}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-500">
                               <AlertCircle size={14} />
                               <span className="text-[9px] italic font-black uppercase tracking-widest">Zéro Flux</span>
                            </div>
                          )}
                        </td>

                        <td className="p-6 md:p-8 text-center">
                          {lastTx?.TX_ProofUrl ? (
                            <a href={lastTx.TX_ProofUrl} target="_blank" rel="noreferrer"
                               className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all group/btn border border-blue-600/20 hover:border-transparent">
                              <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Voir</span>
                            </a>
                          ) : (
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Aucun Doc</span>
                          )}
                        </td>

                        <td className="p-6 md:p-8">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleAction(tenant.T_Id, 'ACTIVATE')}
                              disabled={isProcessing === tenant.T_Id || tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-30 active:scale-95 flex items-center gap-2 border-none cursor-pointer"
                            >
                              {isProcessing === tenant.T_Id ? <Loader2 className="animate-spin" size={14}/> : <Check size={14} strokeWidth={4} />}
                              Valider
                            </button>
                            
                            {tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE && (
                              <button 
                                onClick={() => handleAction(tenant.T_Id, 'SUSPEND')}
                                disabled={isProcessing === tenant.T_Id}
                                className="p-3 bg-white/5 border border-white/10 text-slate-500 rounded-2xl hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all active:scale-90 border-none cursor-pointer"
                                title="Suspendre Licence"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {tenants.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700 opacity-30">
                          <div className="w-20 h-20 bg-white/5 rounded-4xl flex items-center justify-center text-slate-400 border border-dashed border-white/10">
                            <Clock size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] italic m-0">Zéro opération en attente</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- 📡 CRM TELEMETRY FOOTER --- */}
        <footer className="mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center opacity-30 border-t border-white/5 shrink-0 gap-4">
           <div className="flex flex-col gap-1 text-center sm:text-left">
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic m-0">Qualisoft Enterprise CRM v2.1</p>
             <p className="text-[7px] md:text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] m-0">Status : Synchronisé</p>
           </div>
           <div className="text-center sm:text-right">
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic m-0">Souveraineté Numérique</p>
           </div>
        </footer>
      </div>
    </div>
  );
}

function Crown({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
      <path d="M5 20h14"/>
    </svg>
  );
}