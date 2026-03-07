/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🚀 MODULE : BIG BANG MATRIX (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Provisioning atomique de nouveaux nœuds territoriaux (Tenants).
 * DESIGN : Industrial High-Density, Zero-Scroll Form.
 * RÉVISION : 07 Mars 2026 | 02:40 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Rocket, ShieldCheck, Globe, Building2, 
  Mail, Lock, Loader2, ChevronLeft 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';

export default function MatrixDeploy() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    adminEmail: '',
    plan: 'GOLD'
  });

  const handleProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Initialisation du Big Bang Matrix...");

    try {
      await apiClient.post('/admin/matrix/provision', formData);
      toast.success("NŒUD ACTIVÉ : Synchronisation du cluster en cours.", { id: tid });
      router.push('/admin/matrix');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Échec du déploiement.", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 md:p-12 gap-10 font-sans italic text-white animate-in slide-in-from-right-4 duration-700">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:text-blue-500 transition-all bg-transparent border-none cursor-pointer">
            <ChevronLeft size={14} /> Retour Cluster
          </button>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0">
            Big <span className="text-blue-600">Bang</span> Matrix
          </h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar pb-10">
        <form onSubmit={handleProvisioning} className="w-full max-w-2xl bg-white/5 border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-4xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Rocket size={150} />
          </div>

          <div className="space-y-8 relative z-10">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-500 border-b border-blue-500/20 pb-4 m-0">Identité du Nœud</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ✅ FIX : Typage explicite (v: string) pour supprimer l'erreur de build */}
              <MatrixInput 
                label="Désignation Sociale" 
                placeholder="EX: SDE SÉNÉGAL" 
                value={formData.companyName} 
                onChange={(v: string) => setFormData({...formData, companyName: v})} 
              />
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Domaine Matrix (Slug)</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    required 
                    placeholder="sde-sn"
                    className="w-full bg-black/40 border border-white/10 rounded-3xl py-5 pl-16 pr-24 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all shadow-inner"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700">.QUALISOFT.SN</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MatrixInput 
                label="Email Admin Racine" 
                placeholder="ADMIN@CLIENT.COM" 
                type="email"
                value={formData.adminEmail} 
                onChange={(v: string) => setFormData({...formData, adminEmail: v})} 
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Plan de Licence</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-3xl py-5 px-8 text-white font-black italic uppercase text-xs outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                >
                  <option value="SILVER">SDE SILVER (SMI)</option>
                  <option value="GOLD">SDE GOLD (MULTI-ISO)</option>
                  <option value="PLATINUM">SDE PLATINUM (ELITE)</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-8 rounded-[2.5rem] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.5em] hover:bg-white hover:text-slate-950 transition-all shadow-4xl active:scale-95 border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" size={24} /> : "LANCER LE DÉPLOIEMENT DU NŒUD"}
          </button>
        </form>
      </div>
    </div>
  );
}

// COMPOSANT ATOMIQUE TYPÉ SDE
function MatrixInput({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">{label}</label>
      <input 
        type={type} required placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-3xl py-5 px-8 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 shadow-inner"
        value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}