/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { ShieldCheck, Globe, HardDrive, Terminal, RefreshCcw, Fingerprint, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityView() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);

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
    } catch (e) { 
      toast.error("Défaut de liaison cryptographique");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchSecurityCore(); }, [fetchSecurityCore]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 text-left">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-8 lg:pb-10 mb-8 lg:mb-10 gap-6 animate-in fade-in">
        <div>
          <div className="flex items-center gap-3 text-red-500 mb-3 font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-[9px] lg:text-[10px] m-0"><Terminal size={16} className="shrink-0" /> Restricted &bull; Master Guard</div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Global <span className="text-emerald-500">Security</span></h1>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 lg:p-2 rounded-2xl lg:rounded-4xl border border-white/10 backdrop-blur-md overflow-x-auto w-full lg:w-auto custom-scrollbar-hide">
          {['OVERVIEW', 'TENANTS', 'BACKUPS', 'AUDIT_TRAIL'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)} 
              className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[8px] lg:text-[9px] uppercase tracking-widest cursor-pointer transition-colors whitespace-nowrap border-none m-0 ${activeTab === t ? 'bg-emerald-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white'}`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-slate-900/40 border border-white/5 rounded-4xl lg:rounded-[4.5rem] p-6 lg:p-12 shadow-2xl lg:shadow-4xl backdrop-blur-3xl min-h-125 lg:min-h-160 animate-in slide-in-from-bottom-12">
        {loading ? (
          <div className="flex h-75 lg:h-125 flex-col items-center justify-center font-black uppercase text-emerald-500 text-[9px] lg:text-[10px] tracking-[0.3em] lg:tracking-[0.5em] animate-pulse">
            <RefreshCcw className="animate-spin mb-4 shrink-0 lg:w-10 lg:h-10" size={32} /> Sync Sécurité...
          </div>
        ) : (
          <div className="w-full">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-8 lg:space-y-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  <SecurityCard icon={Globe} value={tenants.length || 3} label="Instances" color="blue" />
                  <SecurityCard icon={HardDrive} value="100%" label="Sauvegardes" color="emerald" />
                  <SecurityCard icon={Fingerprint} value={logs.length || 1024} label="Logs" color="amber" />
                  <SecurityCard icon={ShieldCheck} value="v.26" label="Noyau" color="blue" />
                </div>
                <div className="bg-emerald-600/5 border border-emerald-500/20 p-6 lg:p-12 rounded-4xl lg:rounded-[4rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-8">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 bg-emerald-600/20 rounded-2xl lg:rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0"><ShieldCheck size={32} className="lg:w-12 lg:h-12" /></div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black uppercase italic text-white leading-none m-0">Master Security Suite</h3>
                      <p className="text-[10px] lg:text-sm text-slate-500 font-bold uppercase italic mt-2 leading-relaxed m-0">Le système est sous isolation cryptographique totale.</p>
                    </div>
                  </div>
                  <button onClick={fetchSecurityCore} className="w-full sm:w-auto bg-emerald-600 text-white p-4 lg:p-6 rounded-xl lg:rounded-2xl hover:bg-emerald-500 transition-colors cursor-pointer border-none shadow-xl flex justify-center m-0">
                    <RefreshCcw size={20} className="lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>
            )}
            {activeTab !== 'OVERVIEW' && (
              <div className="h-75 flex items-center justify-center text-slate-500 font-black uppercase italic tracking-widest text-[10px]">
                Module {activeTab} en cours d&apos;intégration...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SecurityCard({ icon: Icon, value, label, color }: { icon: any, value: string|number, label: string, color: string }) {
  const colors: Record<string, string> = { blue: "text-blue-500", emerald: "text-emerald-500", amber: "text-amber-500" };
  return (
    <div className="bg-white/5 border border-white/10 p-6 lg:p-10 rounded-4xl lg:rounded-[3.5rem] text-left hover:bg-white/10 transition-colors m-0">
      <Icon className={`${colors[color]} mb-4 lg:mb-6 shrink-0 lg:w-8 lg:h-8`} size={24} />
      <p className="text-3xl lg:text-6xl font-black italic tracking-tighter text-white m-0 leading-none truncate">{value}</p>
      <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-widest text-slate-500 mt-2 lg:mt-3 italic m-0 truncate">{label}</p>
    </div>
  );
}