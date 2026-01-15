/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  ClipboardCheck, User, MapPin, Plus, Calendar, Loader2, FolderTree, FileText, ArrowRight
} from 'lucide-react';

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    AU_Title: '', AU_Reference: `AUD-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
    AU_DateAudit: '', AU_Scope: '', AU_LeadId: '', AU_SiteId: '', AU_ProcessusId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAudits, resUsers, resSites, resProcs] = await Promise.all([
        apiClient.get('/audits'),
        apiClient.get('/users'),
        apiClient.get('/sites'),
        apiClient.get('/processus')
      ]);
      setAudits(resAudits.data || []);
      setUsers(resUsers.data || []);
      setSites(resSites.data || []);
      setProcesses(resProcs.data || []);
    } catch (err) { console.error("Erreur Sync Audits"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/audits', formData);
      setFormData({ ...formData, AU_Title: '', AU_DateAudit: '', AU_LeadId: '', AU_SiteId: '', AU_ProcessusId: '' });
      fetchData();
    } catch (err: any) { alert("Erreur de programmation"); }
  };

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase"><Loader2 className="animate-spin mr-3" /> Analyse du Plan d&apos;Audit...</div>;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white">Gestion des <span className="text-blue-500">Audits</span></h1>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Surveillance du Système de Management Intégré</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl h-fit sticky top-10">
          <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3"><Plus className="text-blue-500" /> Planifier</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Titre de l'audit" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-white" 
                   value={formData.AU_Title} onChange={e => setFormData({...formData, AU_Title: e.target.value})} />
            <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-white" 
                   value={formData.AU_DateAudit} onChange={e => setFormData({...formData, AU_DateAudit: e.target.value})} />
            <select required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-slate-400"
                    value={formData.AU_ProcessusId} onChange={e => setFormData({...formData, AU_ProcessusId: e.target.value})}>
              <option value="">-- Processus --</option>
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-slate-900">{p.PR_Libelle}</option>)}
            </select>
            <select required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-slate-400"
                    value={formData.AU_SiteId} onChange={e => setFormData({...formData, AU_SiteId: e.target.value})}>
              <option value="">-- Site --</option>
              {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-slate-900">{s.S_Name}</option>)}
            </select>
            <button className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl transition-all active:scale-95">Programmer</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 text-white"><ClipboardCheck className="text-blue-500" /> Registre ({audits.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {audits.map((audit) => (
              <div key={audit.AU_Id} className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[8px] font-black bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full uppercase italic">Ref: {audit.AU_Reference}</span>
                    <h3 className="text-2xl font-black uppercase italic mt-3 tracking-tighter text-white">{audit.AU_Title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/audits/${audit.AU_Id}/preuves`} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 shadow-xl" title="Collecter Preuves"><FileText size={18}/></Link>
                    <Link href={`/dashboard/audits/${audit.AU_Id}/rapport`} className="p-3 bg-blue-600 text-white rounded-xl shadow-xl hover:bg-blue-500 transition-all"><ArrowRight size={18}/></Link>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px]"><MapPin size={14} className="text-blue-500"/>{audit.AU_Site?.S_Name}</div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px]"><FolderTree size={14} className="text-blue-500"/>{audit.AU_Processus?.PR_Libelle}</div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px]"><Calendar size={14} className="text-blue-500"/>{new Date(audit.AU_DateAudit).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}