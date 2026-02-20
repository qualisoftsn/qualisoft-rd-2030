/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ NOM ABSOLU : src/app/dashboard/admin/tenants/page.tsx
 * FONCTION : Management des instances SaaS et statistiques SMI.
 * RÔLE : Création à 2 phases (Instance -> Admin) et monitoring d'activité.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Users, CheckCircle, Clock, Search, Plus, Trash2, UserPlus, RefreshCw, ShieldCheck, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTenant, setShowAddTenant] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const [tenantsRes, statsRes] = await Promise.all([
        apiClient.get('/tenants'),
        apiClient.get('/tenants/stats')
      ]);
      setTenants(tenantsRes.data);
      setStats(statsRes.data);
    } catch (error) { toast.error('Vérifiez les routes API Master');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTenants(); }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => t.T_Name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tenants, searchTerm]);

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans text-left">
      <header className="bg-linear-to-r from-blue-900/50 to-indigo-900/50 border-b border-white/10 p-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">Management <span className="text-amber-500">Cluster</span></h1>
            <p className="text-slate-400 text-xs uppercase tracking-[0.4em] italic mt-4">Qualisoft Saas • Architecture Multi-Tenant v4.2</p>
          </div>
          <div className="flex gap-4">
            <button onClick={loadTenants} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:text-blue-500 transition-all cursor-pointer"><RefreshCw size={24}/></button>
            <button onClick={() => setShowAddTenant(true)} className="px-10 py-5 bg-blue-600 rounded-2xl font-black uppercase italic text-xs shadow-3xl hover:bg-blue-500 transition-all border-none cursor-pointer flex items-center gap-3">
              <Plus size={20} /> Nouveau Tenant
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-12 py-16">
        <div className="mb-12 relative group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={24} />
          <input className="w-full bg-[#0F172A] border border-white/5 rounded-4xl py-8 pl-20 pr-8 text-white font-black uppercase italic text-sm outline-none focus:border-blue-600 transition-all shadow-inner" placeholder="Rechercher une structure..." onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="grid gap-8">
          {filteredTenants.map(t => (
            <div key={t.T_Id} className="bg-[#0F172A] p-10 rounded-[3.5rem] border border-white/5 flex items-center justify-between hover:border-blue-600/30 transition-all">
              <div>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">{t.T_Name}</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase italic tracking-widest">{t.T_Email} • {t.T_Plan}</p>
              </div>
              <div className="flex gap-4">
                <button className="p-6 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-3xl hover:bg-amber-500 hover:text-white transition-all"><UserPlus size={24}/></button>
                <button className="p-6 bg-red-500/10 text-red-500 border border-red-500/30 rounded-3xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24}/></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL PHASE 1 : CRÉATION INSTANCE */}
      {showAddTenant && <AddTenantForm onClose={() => setShowAddTenant(false)} onSuccess={loadTenants} />}
    </div>
  );
}

function AddTenantForm({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ T_Name: '', T_Email: '', T_Plan: 'ELITE', T_CeoName: '', T_Phone: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/tenants', form);
      toast.success('Instance créée. Déployez l&apos;Admin (Phase 2).');
      onSuccess(); onClose();
    } catch (e) { toast.error('Erreur de création backend');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-999 backdrop-blur-3xl italic">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[4rem] p-14 w-full max-w-2xl shadow-4xl text-left">
        <h2 className="text-4xl font-black uppercase italic text-white mb-10 flex items-center gap-4"><Plus className="text-blue-500"/> Phase 1 : Instance</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <input required placeholder="DÉSIGNATION STRUCTURE" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-black uppercase outline-none focus:border-blue-500" onChange={e => setForm({...form, T_Name: e.target.value})} />
          <input required type="email" placeholder="EMAIL MASTER" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-black uppercase outline-none focus:border-blue-500" onChange={e => setForm({...form, T_Email: e.target.value})} />
          <button type="submit" disabled={loading} className="w-full py-8 bg-blue-600 rounded-3xl font-black uppercase italic text-xs tracking-widest hover:bg-blue-500 transition-all border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Générer le Noyau Instance"}
          </button>
          <button type="button" onClick={onClose} className="w-full text-xs text-slate-700 font-black uppercase hover:text-white transition-all cursor-pointer">Annuler</button>
        </form>
      </div>
    </div>
  );
}