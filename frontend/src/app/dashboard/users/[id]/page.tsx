/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { 
  Save, ArrowLeft, Loader2, Shield, User, Mail, ShieldCheck, 
  MapPin, Building, Fingerprint, Lock
} from 'lucide-react';

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}`);
      setUser(res.data?.data || res.data);
    } catch {
      toast.error("RUPTURE SDE : Impossible de charger le dossier d'agent.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) loadUser(); }, [id, loadUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 🛡️ ENVOI CONFORME AU MODÈLE ELITE SDE
      await apiClient.put(`/users/${id}`, user);
      toast.success("MATRICE RACI MISE À JOUR");
      setTimeout(() => router.push('/dashboard/users'), 1000);
    } catch {
      toast.error("ERREUR DE SCELLAGE : Échec de mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 italic">Lecture §7.2...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white p-10 italic font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 m-0 leading-none">
            <Shield className="text-blue-500" size={36} /> Habilitation <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic m-0">ISO 9001 §7.2 • ID: {user?.U_Id}</p>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase italic border border-white/10 px-6 py-3 rounded-2xl bg-white/5 shadow-xl">
          <ArrowLeft size={16} /> Retour Annuaire
        </button>
      </header>

      <form onSubmit={handleUpdate} className="flex-1 bg-[#151A2D] border border-white/5 rounded-[4rem] p-12 shadow-4xl relative overflow-y-auto custom-scrollbar flex flex-col gap-12">
        <div className="grid grid-cols-2 gap-x-16 gap-y-10">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <User size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">État Civil SDE</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Prénom</label>
                <input value={user?.U_FirstName || ''} onChange={e => setUser({...user, U_FirstName: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 font-bold italic transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Nom</label>
                <input value={user?.U_LastName || ''} onChange={e => setUser({...user, U_LastName: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 font-bold italic transition-all" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-indigo-500 mb-2">
              <Lock size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Sécurité & Identifiant</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Email SDE (Lecture Seule)</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                <input value={user?.U_Email || ''} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 pl-14 text-sm text-slate-600 font-bold italic cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-500 mb-2">
              <ShieldCheck size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Habilitations Matrix</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Rôle Autorité SMI</label>
              <select value={user?.U_Role || ''} onChange={e => setUser({...user, U_Role: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 font-bold italic text-white appearance-none cursor-pointer">
                <option value="USER" className="bg-[#151A2D]">USER (Accès Standard)</option>
                <option value="PILOTE" className="bg-[#151A2D]">PILOTE (ISO 9001 §5.3)</option>
                <option value="ADMIN" className="bg-[#151A2D]">ADMIN (Tenant Master)</option>
                <option value="SUPER_ADMIN" className="bg-[#151A2D]">SUPER ADMIN (Global)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <MapPin size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Configuration de l&apos;Agent</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="flex flex-col gap-2 opacity-50">
                  <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Site</label>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-sm font-bold text-slate-500 italic flex items-center gap-3">
                    <Building size={16} /> {user?.U_Site?.S_Name || 'ROOT'}
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 italic ml-2">Activation Dossier</label>
                  <select value={user?.U_IsActive ? "true" : "false"} onChange={e => setUser({...user, U_IsActive: e.target.value === "true"})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 font-bold italic text-white appearance-none cursor-pointer">
                    <option value="true" className="bg-[#151A2D]">ACTIF (Habilité)</option>
                    <option value="false" className="bg-[#151A2D]">RÉVOQUÉ (Désactivé)</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 border-t border-white/5 flex gap-6 items-center">
          <div className="flex-1 flex items-center gap-4 text-slate-600">
             <Fingerprint size={24} />
             <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">SDE Sig-System</span>
               <span className="text-[7px] italic">UUID : {user?.U_Id}</span>
             </div>
          </div>
          <button disabled={saving} type="submit" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-16 py-6 rounded-4xl font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-6 text-xs shadow-3xl cursor-pointer active:scale-95">
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={24} strokeWidth={3} /> Sceller le Dossier</>}
          </button>
        </div>
      </form>
    </div>
  );
}