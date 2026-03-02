/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { CheckCircle, Clock, Search, Plus, Trash2, UserPlus, RefreshCw, Loader2, Server } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TenantMaster } from '../page';

export default function TenantsView() {
  const [tenants, setTenants] = useState<TenantMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTenant, setShowAddTenant] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/tenants');
      setTenants(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
    } catch (error) { 
      toast.error('Échec de récupération du Cluster');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadTenants(); }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tenants, searchTerm]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 text-left">
      <header className="mb-10 lg:mb-14 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 lg:pb-12 animate-in fade-in">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-white leading-none m-0">Management <span className="text-amber-500">Cluster</span></h1>
          <p className="text-slate-500 text-[9px] lg:text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] italic mt-3 m-0">Architecture Multi-Tenant</p>
        </div>
        <div className="flex gap-3 lg:gap-4 w-full lg:w-auto">
          <button onClick={loadTenants} className="flex-1 lg:flex-none flex justify-center p-4 lg:p-5 bg-white/5 rounded-xl lg:rounded-2xl border border-white/10 hover:text-amber-500 transition-colors cursor-pointer m-0">
            <RefreshCw size={20} className="lg:w-6 lg:h-6" />
          </button>
          <button onClick={() => setShowAddTenant(true)} className="flex-3 lg:flex-none px-6 py-4 lg:px-10 lg:py-5 bg-amber-600 rounded-xl lg:rounded-2xl font-black uppercase italic text-[10px] lg:text-xs shadow-[0_15px_30px_rgba(245,158,11,0.3)] hover:bg-amber-500 text-white transition-all border-none cursor-pointer flex items-center justify-center gap-3 m-0">
            <Plus size={18} className="shrink-0" /> <span className="whitespace-nowrap">Nouveau Tenant</span>
          </button>
        </div>
      </header>

      <div className="mb-8 lg:mb-12 relative group max-w-3xl">
        <Search className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500" size={20} />
        <input className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl lg:rounded-4xl py-5 lg:py-8 pl-14 lg:pl-20 pr-6 lg:pr-8 text-white font-black uppercase italic text-[10px] lg:text-sm outline-none focus:border-amber-500 transition-colors shadow-inner" placeholder="Rechercher une structure..." onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 animate-in slide-in-from-bottom-12">
          {filteredTenants.map(t => (
            <div key={t.T_Id} className="bg-[#0F172A] p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-amber-500/30 transition-colors shadow-2xl">
              <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 hidden sm:block">
                  <Server size={32} />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white mb-1 lg:mb-2 m-0 leading-none truncate" title={t.T_Name}>{t.T_Name}</h3>
                  <p className="text-[9px] lg:text-[11px] text-slate-500 font-bold uppercase italic tracking-[0.2em] lg:tracking-widest m-0 leading-none mt-2 truncate">{t.T_Email} • {t.T_Plan}</p>
                </div>
              </div>
              <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none p-4 lg:p-5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl lg:rounded-2xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer flex justify-center m-0"><UserPlus size={20} className="lg:w-6 lg:h-6"/></button>
                <button className="flex-1 sm:flex-none p-4 lg:p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl lg:rounded-2xl hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex justify-center m-0"><Trash2 size={20} className="lg:w-6 lg:h-6"/></button>
              </div>
            </div>
          ))}
          {filteredTenants.length === 0 && <p className="text-slate-500 font-black uppercase italic text-sm tracking-widest col-span-full text-center py-10">Aucun cluster actif.</p>}
        </div>
      )}

      {showAddTenant && <AddTenantForm onClose={() => setShowAddTenant(false)} onSuccess={loadTenants} />}
    </div>
  );
}

function AddTenantForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ T_Name: '', T_Email: '', T_Plan: 'ELITE', T_CeoName: '', T_Phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Génération du Noyau Instance...');
    try {
      await apiClient.post('/tenants', form);
      toast.success('Instance créée. Déployez l\'Admin (Phase 2).', { id: tid });
      onSuccess(); 
      onClose();
    } catch (err) { 
      toast.error('Erreur de création backend', { id: tid });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-999 backdrop-blur-3xl italic overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#0B0F1A] border border-white/10 rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-14 w-full max-w-2xl shadow-[0_0_100px_rgba(245,158,11,0.15)] text-left my-auto animate-in zoom-in-95">
        <h2 className="text-2xl lg:text-4xl font-black uppercase italic text-white mb-8 lg:mb-10 flex items-center gap-4 leading-none m-0"><Plus className="text-amber-500 lg:w-8 lg:h-8 shrink-0"/> Phase 1 : Instance</h2>
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          <input required placeholder="DÉSIGNATION STRUCTURE" className="w-full bg-white/5 border border-white/10 p-5 lg:p-6 rounded-xl lg:rounded-2xl text-white font-black uppercase outline-none focus:border-amber-500 transition-colors shadow-inner text-xs lg:text-sm m-0" onChange={e => setForm({...form, T_Name: e.target.value})} />
          <input required type="email" placeholder="EMAIL MASTER" className="w-full bg-white/5 border border-white/10 p-5 lg:p-6 rounded-xl lg:rounded-2xl text-white font-black uppercase outline-none focus:border-amber-500 transition-colors shadow-inner text-xs lg:text-sm m-0" onChange={e => setForm({...form, T_Email: e.target.value})} />
          <div className="pt-4 space-y-4 lg:space-y-6">
            <button type="submit" disabled={loading} className="w-full py-5 lg:py-6 bg-amber-600 text-white rounded-3xl lg:rounded-3xl font-black uppercase italic text-[10px] lg:text-xs tracking-[0.2em] lg:tracking-widest hover:bg-amber-500 transition-colors border-none cursor-pointer flex justify-center m-0 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin shrink-0" size={20} /> : "Générer le Noyau Instance"}
            </button>
            <button type="button" onClick={onClose} className="w-full text-[10px] lg:text-xs text-slate-500 font-black uppercase hover:text-white transition-colors cursor-pointer border-none bg-transparent m-0">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}