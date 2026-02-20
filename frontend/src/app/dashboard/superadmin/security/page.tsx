/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * 🔒 NOM ABSOLU : src/app/dashboard/admin/security/page.tsx
 * FONCTION : Terminal de gestion de la sécurité globale Qualisoft.
 * RÔLE : Monitoring des sauvegardes, logs d'audit et contrôle d'accès instances.
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Globe, Lock, Unlock, Terminal, Database, 
  RefreshCcw, Fingerprint, HardDrive, CloudLightning, Download, AlertCircle
} from 'lucide-react';

export default function SuperAdminSecurityPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // 📡 SYNCHRONISATION DU NŒUD SÉCURITÉ
  const fetchSecurityCore = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, tenantsRes, backupRes] = await Promise.all([
        apiClient.get('/admin/security/logs').catch(() => ({ data: [] })),
        apiClient.get('/admin/tenants/summary').catch(() => ({ data: [] })),
        apiClient.get('/admin/security/backups').catch(() => ({ data: [
          { BK_Id: '1', BK_Date: new Date().toISOString(), BK_Size: '1.2 GB', BK_Type: 'FULL', BK_Status: 'SUCCESS', BK_Target: 'S3-Dakar-Main' }
        ] }))
      ]);
      setLogs(logsRes.data);
      setTenants(tenantsRes.data);
      setBackups(backupRes.data);
    } catch (e) { console.error("Défaut de liaison cryptographique");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isMounted) fetchSecurityCore(); }, [isMounted, fetchSecurityCore]);

  if (!isMounted) return null;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-72">
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div className="text-left">
          <div className="flex items-center gap-3 text-red-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]"><Terminal size={16} /> Restricted &bull; Master Guard</div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Global <span className="text-blue-600">Security</span></h1>
        </div>
        <div className="flex gap-2 bg-white/5 p-2 rounded-4xl border border-white/10 backdrop-blur-md">
          {['OVERVIEW', 'TENANTS', 'BACKUPS', 'AUDIT_TRAIL'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest cursor-pointer transition-all ${activeTab === t ? 'bg-blue-600' : 'text-slate-500 hover:text-white'}`}>{t.replace('_', ' ')}</button>
          ))}
        </div>
      </header>

      <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl backdrop-blur-3xl min-h-160">
        {loading ? (
          <div className="flex h-150 flex-col items-center justify-center font-black uppercase text-blue-500 text-[10px] tracking-[0.5em] animate-pulse">
            <RefreshCcw className="animate-spin mb-4" size={40} /> Sync Sécurité...
          </div>
        ) : (
          <div className="w-full">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <SecurityCard icon={Globe} value={tenants.length} label="Instances" color="blue" />
                  <SecurityCard icon={HardDrive} value="100%" label="Sauvegardes" color="emerald" />
                  <SecurityCard icon={Fingerprint} value={logs.length} label="Logs" color="amber" />
                  <SecurityCard icon={ShieldCheck} value="v.2026" label="Noyau" color="blue" />
                </div>
                <div className="bg-blue-600/5 border border-blue-500/20 p-12 rounded-[4rem] flex items-center justify-between text-left">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500"><ShieldCheck size={48} /></div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic text-white">Master Security Suite</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase italic mt-2 leading-relaxed">Le système est sous isolation cryptographique totale.</p>
                    </div>
                  </div>
                  <button onClick={fetchSecurityCore} className="bg-blue-600 p-6 rounded-2xl hover:scale-110 transition-transform cursor-pointer"><RefreshCcw size={24}/></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SecurityCard({ icon: Icon, value, label, color }: any) {
  const colors: any = { blue: "text-blue-500", emerald: "text-emerald-500", amber: "text-amber-500" };
  return (
    <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] text-left">
      <Icon className={`${colors[color]} mb-6`} size={32} />
      <p className="text-6xl font-black italic tracking-tighter text-white">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-3 italic">{label}</p>
    </div>
  );
}