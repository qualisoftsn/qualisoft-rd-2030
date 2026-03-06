/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CLOSING FINANCIER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Validation des transactions et activation des licences Matrix.
 * DESIGN : 100dvh, ClickUp High-Density, Zero-Scroll Table, Glassmorphism.
 * RÉVISION : 06 Mars 2026 | 21:05 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Check, Ban, Loader2, ShieldCheck, RefreshCcw, 
  Wallet, Banknote, Smartphone, ExternalLink, Activity, AlertCircle, Clock
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

export default function GlobalClosing() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchRegistry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/transactions/pending');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Rupture de flux financier : Liaison Kernel dégradée.");
      setTenants([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

  const handleValidation = async (tenantId: string, action: 'ACTIVATE' | 'SUSPEND') => {
    setActioning(tenantId);
    const tid = toast.loading(`Exécution du protocole ${action}...`);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("REGISTRE SCELLÉ : Licence mise à jour.", { id: tid });
      fetchRegistry();
    } catch {
      toast.error("REJET KERNEL : Opération déclinée.", { id: tid });
    } finally { setActioning(null); }
  };

  // ✅ FIX : Affichage du composant de chargement local
  if (loading) return <LoadingMatrix label="Calcul du Grand Livre..." />;

  return (
    <div className="h-full flex flex-col p-8 md:p-12 gap-10 font-sans italic text-white animate-in zoom-in-95 duration-500">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Qualisoft Sovereign CRM</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Closing <span className="text-blue-600">Financier</span>
          </h1>
        </div>
        <button 
          onClick={fetchRegistry} 
          className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-4 cursor-pointer active:scale-95 shadow-2xl"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
          Actualiser Matrix
        </button>
      </header>

      {/* 📊 REGISTRE DES TRANSACTIONS (Scroll Isolé) */}
      <div className="flex-1 bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col shadow-inner backdrop-blur-md">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-20 border-b border-white/5">
              <tr>
                <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Organisation</th>
                <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-center">Plan</th>
                <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Flux & Preuve</th>
                <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-center">Protocole</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tenants.map((t) => (
                <tr key={t.T_Id} className="group hover:bg-white/5 transition-all duration-300 italic">
                  <td className="p-8">
                    <p className="text-2xl font-black text-white uppercase tracking-tighter m-0 group-hover:text-blue-500 transition-colors leading-none">{t.T_Name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-2 m-0 tracking-widest">{t.T_CeoName || 'N/A'}</p>
                  </td>
                  <td className="p-8 text-center">
                    <span className="bg-blue-600/20 text-blue-500 border border-blue-600/30 px-5 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase">{t.T_Plan}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                       <div className="text-left">
                          <p className="text-2xl font-black text-white m-0 italic">{(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString()} <span className="text-xs text-blue-500 uppercase">XOF</span></p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1 m-0 italic">{t.T_Transactions?.[0]?.TX_PaymentMethod || 'VIREMENT'}</p>
                       </div>
                       {t.T_Transactions?.[0]?.TX_ProofUrl && (
                         <a href={t.T_Transactions[0].TX_ProofUrl} target="_blank" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"><ExternalLink size={20}/></a>
                       )}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center justify-center gap-4">
                       <button 
                         disabled={actioning === t.T_Id}
                         onClick={() => handleValidation(t.T_Id, 'ACTIVATE')} 
                         className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[9px] tracking-widest uppercase hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer active:scale-95 shadow-xl shadow-emerald-900/20"
                       >
                         {actioning === t.T_Id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} className="inline mr-2" />} Activer
                       </button>
                       <button 
                         disabled={actioning === t.T_Id}
                         onClick={() => handleValidation(t.T_Id, 'SUSPEND')} 
                         className="p-4 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border-none cursor-pointer"
                       >
                         <Ban size={18}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-32 text-center opacity-30">
                    <div className="flex flex-col items-center gap-6">
                       <Clock size={60} strokeWidth={1} />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] m-0 italic">Aucune transaction en attente de scellage</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📡 CRM TELEMETRY FOOTER */}
      <footer className="shrink-0 flex items-center justify-between opacity-30 px-6">
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic leading-none">
          <Activity size={14} className="text-blue-500" /> Flux Financiers Scellés • SDE-RD-2026
        </div>
        <div className="text-[9px] font-black italic uppercase tracking-widest">Souveraineté Closing Qualisoft</div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// ✅ COMPOSANT ATOMIQUE : LOADING MATRIX (Indispensable pour éviter l'erreur)
function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1.2em] animate-pulse m-0 pl-[1.2em]">
        {label}
      </p>
    </div>
  );
}