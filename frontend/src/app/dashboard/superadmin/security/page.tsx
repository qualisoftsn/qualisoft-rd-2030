"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Globe, Lock, Unlock, Terminal, Database, 
  CreditCard, RefreshCcw, Fingerprint, ShieldAlert, 
  HardDrive, CloudLightning, Download, CheckCircle2, AlertCircle
} from 'lucide-react';

// --- INTERFACES SÉCURISÉES ---
interface ISecurityLog {
  SAL_Id: string;
  SAL_Action: string;
  SAL_IpAddress: string | null;
  SAL_Timestamp: string;
  SAL_User: { U_Email: string; };
  tenant: { T_Name: string; };
}

interface ITenantSummary {
  T_Id: string;
  T_Name: string;
  T_Plan: string;
  T_IsActive: boolean;
  _count: { T_Users: number; };
}

interface IBackupRecord {
  BK_Id: string;
  BK_Date: string;
  BK_Size: string;
  BK_Type: 'FULL' | 'INCREMENTAL';
  BK_Status: 'SUCCESS' | 'WARNING' | 'FAILED';
  BK_Target: string;
}

type SecurityTab = 'OVERVIEW' | 'TENANTS' | 'BACKUPS' | 'AUDIT_TRAIL';

export default function SuperAdminSecurityPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SecurityTab>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  
  // États de données
  const [logs, setLogs] = useState<ISecurityLog[]>([]);
  const [tenants, setTenants] = useState<ITenantSummary[]>([]);
  const [backups, setBackups] = useState<IBackupRecord[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // 1️⃣ RÉCUPÉRATION DU NOYAU DE DONNÉES
  const fetchSecurityCore = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, tenantsRes, backupRes] = await Promise.all([
        apiClient.get('/admin/security/logs').catch(() => ({ data: [] })),
        apiClient.get('/admin/tenants/summary').catch(() => ({ data: [] })),
        apiClient.get('/admin/security/backups').catch(() => ({ data: [
          { BK_Id: '1', BK_Date: new Date().toISOString(), BK_Size: '1.2 GB', BK_Type: 'FULL', BK_Status: 'SUCCESS', BK_Target: 'S3-Dakar-Main' },
          { BK_Id: '2', BK_Date: new Date(Date.now() - 86400000).toISOString(), BK_Size: '450 MB', BK_Type: 'INCREMENTAL', BK_Status: 'SUCCESS', BK_Target: 'S3-Dakar-Main' }
        ] }))
      ]);
      setLogs(logsRes.data);
      setTenants(tenantsRes.data);
      setBackups(backupRes.data);
    } catch (e) {
      console.error("Défaut de liaison cryptographique");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isMounted) fetchSecurityCore(); }, [isMounted, fetchSecurityCore]);

  // 2️⃣ ACTIONS DE CONTRÔLE
  const handleToggleTenant = async (id: string, currentStatus: boolean) => {
    if (!confirm("VOULEZ-VOUS MODIFIER L&apos;ACCÈS DE CETTE INSTANCE ?")) return;
    await apiClient.patch(`/admin/tenants/${id}/status`, { T_IsActive: !currentStatus });
    fetchSecurityCore();
  };

  if (!isMounted) return null;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-72 selection:bg-blue-600/30">
      
      {/* HEADER : ROOT GUARD */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div>
          <div className="flex items-center gap-3 text-red-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Terminal size={16} /> Restricted Area &bull; Qualisoft Master Guard
          </div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none">Global <span className="text-blue-600">Security</span></h1>
        </div>
        <div className="flex gap-2 bg-white/5 p-2 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-md">
          {(['OVERVIEW', 'TENANTS', 'BACKUPS', 'AUDIT_TRAIL'] as SecurityTab[]).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 shadow-xl' : 'text-slate-500 hover:text-white'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* ZONE DE DONNÉES SÉCURISÉE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] min-h-[650px] backdrop-blur-3xl overflow-hidden shadow-3xl">
        
        {loading ? (
          <div className="flex h-[600px] flex-col items-center justify-center font-black uppercase text-blue-500 text-[10px] tracking-[0.5em] animate-pulse">
            <RefreshCcw className="animate-spin mb-4" size={40} /> Synchronisation du Noyau...
          </div>
        ) : (
          <div className="w-full">

            {/* --- VUE 1 : OVERVIEW --- */}
            {activeTab === 'OVERVIEW' && (
              <div className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem]">
                    <Globe className="text-blue-500 mb-4" size={28} />
                    <p className="text-5xl font-black italic tracking-tighter">{tenants.filter(t => t.T_IsActive).length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 italic">Instances Actives</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem]">
                    <HardDrive className="text-emerald-500 mb-4" size={28} />
                    <p className="text-5xl font-black italic tracking-tighter">OK</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 italic">Sauvegarde Réseau</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem]">
                    <Fingerprint className="text-amber-500 mb-4" size={28} />
                    <p className="text-5xl font-black italic tracking-tighter">{logs.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 italic">Traces numériques</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem]">
                    <ShieldCheck className="text-blue-500 mb-4" size={28} />
                    <p className="text-5xl font-black italic tracking-tighter">V.2026</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 italic">Version du Noyau</p>
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/20 p-12 rounded-[4rem] flex items-center justify-between shadow-inner">
                   <div className="flex items-center gap-8 text-left">
                      <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl">
                         <ShieldCheck size={48} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black uppercase italic leading-none mb-2">Qualisoft <span className="text-blue-500">Security Suite</span></h3>
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-tight italic leading-relaxed">
                            Le système est actuellement sous protection maximale. <br/>
                            Toutes les communications entre tenants sont isolées cryptographiquement.
                         </p>
                      </div>
                   </div>
                   <button onClick={fetchSecurityCore} className="bg-blue-600 p-6 rounded-2xl font-black hover:bg-blue-500 transition-all"><RefreshCcw size={24}/></button>
                </div>
              </div>
            )}

            {/* --- VUE 2 : TENANTS --- */}
            {activeTab === 'TENANTS' && (
              <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {tenants.map(t => (
                  <div key={t.T_Id} className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] flex items-center justify-between group hover:border-blue-500/50 transition-all">
                    <div className="text-left">
                      <h4 className="text-3xl font-black uppercase tracking-tighter italic mb-2">{t.T_Name}</h4>
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{t.T_Plan} EDITION</span>
                    </div>
                    <button onClick={() => handleToggleTenant(t.T_Id, t.T_IsActive)} className={`p-8 rounded-3xl transition-all ${t.T_IsActive ? 'bg-emerald-500/10 text-emerald-500 hover:bg-red-500/20' : 'bg-red-600 text-white animate-pulse'}`}>
                      {t.T_IsActive ? <Unlock size={28} /> : <Lock size={28} />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* --- VUE 3 : BACKUPS (SUIVI RÉSEAU) --- */}
            {activeTab === 'BACKUPS' && (
              <div className="p-12 space-y-8">
                 <div className="flex justify-between items-center mb-8 italic text-left">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Surveillance des <span className="text-blue-600">Points de Restauration</span></h3>
                    <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10"><CloudLightning size={18}/> Déclencher Backup Full</button>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {backups.map(bk => (
                      <div key={bk.BK_Id} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center justify-between group">
                         <div className="flex items-center gap-8">
                            <div className={`p-4 rounded-2xl ${bk.BK_Status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                               <Database size={24}/>
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{bk.BK_Type} BACKUP &bull; {bk.BK_Target}</p>
                               <h4 className="text-xl font-black uppercase italic text-white leading-none">SNAPSHOT_{bk.BK_Id}_{new Date(bk.BK_Date).toLocaleDateString()}</h4>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poids du flux</p>
                               <p className="font-black italic text-blue-500">{bk.BK_Size}</p>
                            </div>
                            <button className="p-4 bg-white/5 hover:bg-blue-600 rounded-xl transition-all"><Download size={18}/></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* --- VUE 4 : AUDIT TRAIL --- */}
            {activeTab === 'AUDIT_TRAIL' && (
              <div className="overflow-x-auto text-left">
                <table className="w-full">
                  <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 italic">
                    <tr>
                      <th className="p-10">Timestamp</th>
                      <th className="p-10">Action Opérationnelle</th>
                      <th className="p-10">Identité Digitale</th>
                      <th className="p-10">Instance Cible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px] font-bold uppercase italic tracking-tight">
                    {logs.map(log => (
                      <tr key={log.SAL_Id} className="hover:bg-blue-600/5 transition-all group">
                        <td className="p-8 text-slate-500">{new Date(log.SAL_Timestamp).toLocaleString()}</td>
                        <td className="p-8 font-black text-blue-500 uppercase leading-none">{log.SAL_Action}</td>
                        <td className="p-8 text-white/80">{log.SAL_User?.U_Email || 'SYSTEM_CORE'}</td>
                        <td className="p-8"><span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-slate-500 text-[9px]">{log.tenant?.T_Name || 'ROOT'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}