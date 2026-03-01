/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : CONSOLE CRM & CLOSING FINANCIER
 * -------------------------------------------------------------------------
 * RÔLE : Validation des transactions et activation manuelle des licences.
 * STRATÉGIE : Interfaçage direct avec le noyau de facturation NestJS.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:25 GMT
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, Clock, Smartphone, CreditCard, Banknote, 
  Loader2, ShieldCheck, RefreshCcw, User, Phone, Wallet
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { Tenant, Transaction, SubscriptionStatus, PaymentMethod } from '@/types/elite-sde';
import { toast } from 'sonner';

// Extension locale pour inclure les relations Prisma
interface TenantWithTransactions extends Tenant {
  T_Transactions: Transaction[];
}

export default function AdminPaymentsPage() {
  const [tenants, setTenants] = useState<TenantWithTransactions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  /**
   * 📡 RÉCUPÉRATION DES FLUX EN ATTENTE
   * Interroge le registre pour extraire les tenants ayant des transactions non validées.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Endpoint dédié au closing master
      const res = await apiClient.get<TenantWithTransactions[]>('/admin/transactions/pending');
      setTenants(res.data);
    } catch (err) {
      toast.error("Erreur de synchronisation CRM.");
      console.error("[CRM ERROR]:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ⚖️ DÉCISION DE CLOSING
   * @param tenantId Identifiant du nœud
   * @param action Action souveraine (ACTIVATE | SUSPEND | REJECT)
   */
  const handleAction = async (tenantId: string, action: 'ACTIVATE' | 'SUSPEND' | 'REJECT') => {
    const tid = toast.loading(`Protocole : ${action}...`);
    setIsProcessing(tenantId);
    
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("Registre mis à jour avec succès.", { id: tid });
      fetchData(); // Rechargement atomique
    } catch (err) {
      toast.error("Échec de l'opération Kernel.", { id: tid });
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 italic font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* --- HEADER CRM --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Qualisoft Sovereign Admin</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
              Console <span className="text-blue-600 not-italic">Closing</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Gestion des flux financiers et activation de licences</p>
          </div>
          
          <button 
            onClick={fetchData} 
            className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-3xl font-black text-[10px] text-slate-600 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest active:scale-95"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
            Actualiser le CRM
          </button>
        </div>

        {/* --- TABLEAU DE GESTION --- */}
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">Lecture du registre Master...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Organisation & Contact</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Contrat & Plan</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Dernier Flux</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Preuve</th>
                    <th className="p-8 text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => {
                    const lastTx = tenant.T_Transactions?.[0];
                    return (
                      <tr key={tenant.T_Id} className="group hover:bg-blue-50/20 transition-all duration-300">
                        {/* 🏢 Organisation */}
                        <td className="p-8">
                          <div className="flex flex-col text-left">
                            <span className="font-black text-slate-950 uppercase tracking-tighter text-2xl group-hover:text-blue-600 transition-colors leading-none mb-3">
                              {tenant.T_Name}
                            </span>
                            <div className="flex items-center gap-4 text-slate-400">
                              <span className="flex items-center gap-1 text-[10px] font-black italic uppercase tracking-widest leading-none"><User size={12}/> {tenant.T_CeoName}</span>
                              <span className="flex items-center gap-1 text-[10px] font-black italic uppercase tracking-widest leading-none"><Phone size={12}/> {tenant.T_Phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* 📜 Plan */}
                        <td className="p-8">
                          <div className="flex flex-col text-left gap-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tenant.T_Plan}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit border ${
                              tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-amber-50 border-amber-100 text-amber-600'
                            }`}>
                              {tenant.T_SubscriptionStatus}
                            </span>
                          </div>
                        </td>

                        {/* 💰 Transaction */}
                        <td className="p-8">
                          {lastTx ? (
                            <div className="flex flex-col text-left">
                              <span className="font-black text-slate-900 text-xl tracking-tighter">
                                {lastTx.TX_Amount.toLocaleString()} <span className="text-blue-500 text-[10px]">XOF</span>
                              </span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                {lastTx.TX_PaymentMethod === PaymentMethod.WAVE ? <Smartphone size={12}/> : <Wallet size={12}/>}
                                {lastTx.TX_PaymentMethod}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic font-black uppercase tracking-widest">Zéro Flux</span>
                          )}
                        </td>

                        {/* 🔍 Référence */}
                        <td className="p-8">
                          <code className="text-[10px] font-mono bg-slate-100 p-3 rounded-2xl text-slate-600 border border-slate-200 uppercase italic font-bold">
                            {lastTx ? lastTx.TX_Reference : 'N/A'}
                          </code>
                        </td>

                        {/* ⚖️ Actions Master */}
                        <td className="p-8">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleAction(tenant.T_Id, 'ACTIVATE')}
                              disabled={isProcessing === tenant.T_Id || tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE}
                              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-20 active:scale-90"
                            >
                              {isProcessing === tenant.T_Id ? <Loader2 className="animate-spin" size={14}/> : 'Activer'}
                            </button>
                            
                            {tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE && (
                              <button 
                                onClick={() => handleAction(tenant.T_Id, 'SUSPEND')}
                                disabled={isProcessing === tenant.T_Id}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-500 transition-all active:scale-90"
                              >
                                Suspendre
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* EMPTY STATE */}
              {tenants.length === 0 && (
                <div className="p-32 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Clock size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] italic">Aucune opération en attente de closing</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- FOOTER STATUS --- */}
        <div className="flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em] italic">
          <p>Qualisoft Enterprise CRM v2.1</p>
          <p>Souveraineté Numérique RD 2030</p>
        </div>
      </div>
    </div>
  );
}