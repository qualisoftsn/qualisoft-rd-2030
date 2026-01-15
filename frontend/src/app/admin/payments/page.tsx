/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, Clock, Smartphone, CreditCard, Banknote, 
  Loader2, ShieldCheck, AlertCircle, RefreshCcw, User, Phone, Globe
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function AdminPaymentsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Récupération des données CRM (Tenants + Transactions)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/transactions/pending');
      setTenants(res.data);
    } catch (err) {
      setError("Erreur de connexion au serveur Qualisoft.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Action de Closing (ACTIVATE | DEACTIVATE | REJECT)
  const handleAction = async (tenantId: string, action: 'ACTIVATE' | 'DEACTIVATE' | 'REJECT') => {
    const confirmMsg = action === 'ACTIVATE' ? "Valider le paiement et activer la licence ?" : "Refuser cette transaction ?";
    if (!confirm(confirmMsg)) return;
    
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      alert("Action effectuée avec succès.");
      fetchData(); // Rafraîchir la liste
    } catch (err) {
      alert("Erreur lors de l'opération.");
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 italic">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER CRM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg">
              <ShieldCheck size={14} />
              <span>Qualisoft Administration</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Console <span className="text-blue-600 not-italic">Closing</span>
            </h1>
            <p className="text-slate-500 font-medium">Gestion des abonnements et validation des flux financiers</p>
          </div>
          
          <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all italic">
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualiser le CRM
          </button>
        </div>

        {/* TABLEAU DES CLIENTS (TENANTS) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Synchronisation base de données...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Entreprise & Contact</th>
                    <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Plan & Statut</th>
                    <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Dernier Flux</th>
                    <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Référence</th>
                    <th className="p-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic font-mono">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tenants.map((tenant) => {
                    const lastTx = tenant.T_Transactions?.[0];
                    return (
                      <tr key={tenant.T_Id} className="hover:bg-blue-50/30 transition-all group">
                        {/* Infos Client */}
                        <td className="p-6">
                          <div className="flex flex-col text-left">
                            <span className="font-black text-slate-900 uppercase tracking-tighter text-lg">{tenant.T_Name}</span>
                            <div className="flex items-center gap-3 mt-1 text-slate-400">
                              <span className="flex items-center gap-1 text-[10px] font-bold italic"><User size={12}/> {tenant.T_CeoName}</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold italic"><Phone size={12}/> {tenant.T_Phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Plan & Subscription */}
                        <td className="p-6">
                          <div className="flex flex-col text-left italic">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tenant.T_Plan}</span>
                            <span className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full w-fit ${
                              tenant.T_SubscriptionStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {tenant.T_SubscriptionStatus}
                            </span>
                          </div>
                        </td>

                        {/* Montant & Méthode */}
                        <td className="p-6">
                          {lastTx ? (
                            <div className="flex flex-col text-left">
                              <span className="font-black text-slate-900">
                                {lastTx.TX_Amount.toLocaleString()} <span className="text-blue-500 text-[10px]">XOF</span>
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                {lastTx.TX_PaymentMethod === 'WAVE' ? <Smartphone size={10}/> : <Banknote size={10}/>}
                                {lastTx.TX_PaymentMethod}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic font-bold">AUCUN PAIEMENT</span>
                          )}
                        </td>

                        {/* Référence Transaction */}
                        <td className="p-6">
                          <code className="text-[10px] font-mono bg-slate-50 p-2 rounded-lg text-slate-500 border border-slate-100 uppercase italic">
                            {lastTx ? lastTx.TX_Reference : 'N/A'}
                          </code>
                        </td>

                        {/* Actions de validation */}
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleAction(tenant.T_Id, 'ACTIVATE')}
                              disabled={isProcessing === tenant.T_Id || tenant.T_SubscriptionStatus === 'ACTIVE'}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 shadow-lg shadow-emerald-100"
                            >
                              {isProcessing === tenant.T_Id ? <Loader2 className="animate-spin" size={14}/> : 'Activer'}
                            </button>
                            
                            {tenant.T_SubscriptionStatus === 'ACTIVE' && (
                              <button 
                                onClick={() => handleAction(tenant.T_Id, 'DEACTIVATE')}
                                disabled={isProcessing === tenant.T_Id}
                                className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
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
              
              {tenants.length === 0 && (
                <div className="p-24 text-center">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="text-slate-200" size={32} />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] italic">Zéro client dans la base de données</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}