/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : AdminPaymentsPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Console de Closing Financier & Activation de Licences.
 * FONCTION : Validation manuelle des flux (Wave, OM, Transfert) et Scellage.
 * RÉVISION : 03 Mars 2026 | 14:15 GMT
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
  Tenant, 
  Transaction, 
  SubscriptionStatus, 
  PaymentMethod,
  Plan 
} from '@/types/elite-sde';
import { toast } from 'sonner';

// ✅ Extension de type pour les jointures relationnelles Prisma
interface TenantWithTransactions extends Tenant {
  T_Transactions: Transaction[];
}

export default function AdminPaymentsPage() {
  const [tenants, setTenants] = useState<TenantWithTransactions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  /**
   * 📡 SYNCHRONISATION CRM
   * Récupère les nœuds territoriaux ayant des flux de paiement en attente.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Appel au Kernel Matrix
      const res = await apiClient.get<TenantWithTransactions[]>('/admin/transactions/pending');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("ÉCHEC SYNCHRO : Impossible de joindre le registre financier.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ⚖️ DÉCISION SOUVERAINE (Closing)
   * @param tenantId UUID du Tenant
   * @param action Statut cible (ACTIVATE | SUSPEND | REJECT)
   */
  const handleAction = async (tenantId: string, action: 'ACTIVATE' | 'SUSPEND' | 'REJECT') => {
    const tid = toast.loading(`Protocole ${action} en cours...`);
    setIsProcessing(tenantId);
    
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("REGISTRE SCELLÉ : La licence a été mise à jour.", { id: tid });
      fetchData(); // Rafraîchissement atomique
    } catch (err) {
      toast.error("REJET KERNEL : L'opération a été déclinée par le nœud.", { id: tid });
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 lg:p-16 italic font-sans selection:bg-blue-600/10">
      <div className="max-w-400 mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* --- 🛡️ HEADER CRM MATRIX --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-slate-200 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-5 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Qualisoft Sovereign CRM</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Console <span className="text-blue-600 not-italic">Closing</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em]">Pilotage des flux financiers & Activation des Nœuds SDE</p>
          </div>
          
          <button 
            onClick={fetchData} 
            disabled={isLoading}
            className="flex items-center gap-4 px-10 py-5 bg-white border border-slate-200 rounded-4xl font-black text-[11px] text-slate-700 hover:bg-slate-50 hover:shadow-xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            Actualiser Matrix
          </button>
        </header>

        {/* --- 📊 REGISTRE DES TRANSACTIONS --- */}
        <div className="rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden backdrop-blur-3xl bg-white/90">
          {isLoading ? (
            <div className="p-48 flex flex-col items-center justify-center gap-8">
              <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={3} />
              <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.6em] animate-pulse italic">Lecture du grand livre...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Organisation</th>
                    <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Offre & Statut</th>
                    <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Flux Financier</th>
                    <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center">Preuve</th>
                    <th className="p-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Protocole</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => {
                    const lastTx = tenant.T_Transactions?.[0];
                    return (
                      <tr key={tenant.T_Id} className="group hover:bg-blue-50/30 transition-all duration-500">
                        {/* 🏢 Organisation Identity */}
                        <td className="p-10">
                          <div className="flex flex-col text-left">
                            <span className="font-black text-slate-950 uppercase tracking-tighter text-3xl group-hover:text-blue-600 transition-colors leading-none mb-4 italic">
                              {tenant.T_Name}
                            </span>
                            <div className="flex items-center gap-6 text-slate-400">
                              <span className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest"><User size={14} className="text-blue-500"/> {tenant.T_CeoName || 'N/A'}</span>
                              <span className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest"><Phone size={14} className="text-blue-500"/> {tenant.T_Phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* 📜 Subscription Status */}
                        <td className="p-10">
                          <div className="flex flex-col text-left gap-3">
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                              <Crown size={12} /> {tenant.T_Plan}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-fit border-2 ${
                              tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE 
                              ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' 
                              : 'bg-amber-50 border-amber-500/20 text-amber-600'
                            }`}>
                              ● {tenant.T_SubscriptionStatus}
                            </span>
                          </div>
                        </td>

                        {/* 💰 Last Transaction Details */}
                        <td className="p-10">
                          {lastTx ? (
                            <div className="flex flex-col text-left">
                              <span className="font-black text-slate-900 text-2xl tracking-tighter italic">
                                {lastTx.TX_Amount.toLocaleString()} <span className="text-blue-500 text-xs not-italic">XOF</span>
                              </span>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                  {lastTx.TX_PaymentMethod === PaymentMethod.WAVE ? <Smartphone size={14}/> : <Banknote size={14}/>}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  {lastTx.TX_PaymentMethod}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-300">
                               <AlertCircle size={16} />
                               <span className="text-[10px] italic font-black uppercase tracking-widest">Zéro Flux Détecté</span>
                            </div>
                          )}
                        </td>

                        {/* 🔍 Digital Proof (URL) */}
                        <td className="p-10 text-center">
                          {lastTx?.TX_ProofUrl ? (
                            <a 
                              href={lastTx.TX_ProofUrl} 
                              target="_blank" 
                              className="inline-flex items-center gap-2 p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg group/btn"
                            >
                              <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Vérifier</span>
                            </a>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">Aucun Document</span>
                          )}
                        </td>

                        {/* ⚖️ Master Controls */}
                        <td className="p-10">
                          <div className="flex items-center justify-center gap-4">
                            <button 
                              onClick={() => handleAction(tenant.T_Id, 'ACTIVATE')}
                              disabled={isProcessing === tenant.T_Id || tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE}
                              className="px-8 py-4 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-20 active:scale-95 flex items-center gap-3 border-none cursor-pointer"
                            >
                              {isProcessing === tenant.T_Id ? <Loader2 className="animate-spin" size={16}/> : <Check size={16} strokeWidth={4} />}
                              Valider Flux
                            </button>
                            
                            {tenant.T_SubscriptionStatus === SubscriptionStatus.ACTIVE && (
                              <button 
                                onClick={() => handleAction(tenant.T_Id, 'SUSPEND')}
                                disabled={isProcessing === tenant.T_Id}
                                className="p-4 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:text-red-600 hover:border-red-600 transition-all active:scale-90 shadow-sm border-none cursor-pointer"
                                title="Suspendre Licence"
                              >
                                <Ban size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* EMPTY STATE MASTER */}
              {tenants.length === 0 && (
                <div className="p-48 text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                    <Clock size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em] italic">Zéro opération en attente</p>
                    <p className="text-slate-300 text-[10px] uppercase tracking-widest">Le registre Matrix est à jour.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 📡 CRM TELEMETRY FOOTER --- */}
        <footer className="mt-auto px-10 py-12 flex justify-between items-center opacity-30 border-t border-slate-200">
           <div className="flex flex-col gap-2">
             <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.6em] italic m-0">Qualisoft Enterprise CRM v2.1</p>
             <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] m-0 leading-none">Status : Synchronisé</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] italic m-0">Souveraineté Numérique RD 2026</p>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Dakar Hub • Cluster Master 01</p>
           </div>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.1); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

// Composant Icon local pour le Plan
function Crown({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
      strokeLinejoin="round" className={className}
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
      <path d="M5 20h14"/>
    </svg>
  );
}