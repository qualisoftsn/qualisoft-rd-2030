/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { 
  Save, ArrowLeft, Loader2, Shield, User, Mail, ShieldCheck, 
  MapPin, Building, Fingerprint, Activity, Lock
} from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string; 
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Tentative 1 : Par ID technique
      const res = await apiClient.get(`/users/${id}`);
      const data = res.data?.data || res.data;
      
      if (!data) throw new Error("Agent non trouvé");
      setUser(data);
    } catch (err) {
      console.error("Échec UUID, tentative par Email...");
      // Tentative 2 : Fallback si ton API attend l'email ou si l'UUID est mal géré
      try {
         const resAll = await apiClient.get('/users');
         const allUsers = resAll.data?.data || resAll.data || [];
         const found = allUsers.find((u: any) => u.U_Id === id || (u as any).id === id);
         if (found) {
           setUser(found);
         } else {
           toast.error("RUPTURE SDE : Agent introuvable dans la matrice.");
         }
      } catch (e) {
        toast.error("RUPTURE SDE : Impossible de charger le dossier d'agent.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/users/${id}`, user);
      toast.success("HABILITATIONS SCELLÉES");
      setTimeout(() => router.push('/dashboard/users'), 1000);
    } catch {
      toast.error("ERREUR DE SCELLAGE");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 box-border">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse italic">Lecture §7.2...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white p-10 italic font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 m-0 leading-none">
            <Shield className="text-blue-500" size={36} /> Dossier <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 m-0 italic">ISO 9001 §7.2 • ID: {id}</p>
        </div>
        <button onClick={() => router.push('/dashboard/users')} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase italic border border-white/10 px-6 py-3 rounded-2xl bg-white/5 cursor-pointer shadow-xl">
          <ArrowLeft size={16} /> Retour Annuaire
        </button>
      </header>

      <form onSubmit={handleUpdate} className="flex-1 bg-[#151A2D] border border-white/5 rounded-[4rem] p-12 shadow-4xl overflow-y-auto custom-scrollbar flex flex-col gap-10">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase text-blue-500 flex items-center gap-2 italic tracking-widest"><User size={16}/> État Civil SDE</span>
            <div className="grid grid-cols-2 gap-4">
              <input value={user?.U_FirstName || ''} onChange={e => setUser({...user, U_FirstName: e.target.value})} placeholder="Prénom" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-500 text-white" />
              <input value={user?.U_LastName || ''} onChange={e => setUser({...user, U_LastName: e.target.value})} placeholder="Nom" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-500 text-white" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase text-indigo-500 flex items-center gap-2 italic tracking-widest"><Lock size={16}/> Sécurité</span>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input value={user?.U_Email || ''} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 pl-14 text-sm text-slate-600 font-bold italic cursor-not-allowed" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase text-emerald-500 flex items-center gap-2 italic tracking-widest"><ShieldCheck size={16}/> Rôle Matrix</span>
            <select value={user?.U_Role || 'USER'} onChange={e => setUser({...user, U_Role: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white italic outline-none focus:border-blue-500 cursor-pointer">
              <option value="USER">USER (Accès Standard)</option>
              <option value="PILOTE">PILOTE (Process Owner §5.3)</option>
              <option value="ADMIN">ADMIN (Tenant Master)</option>
              <option value="SUPER_ADMIN">SUPER ADMIN (Global Matrix)</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase text-amber-500 flex items-center gap-2 italic tracking-widest"><Activity size={16}/> Statut Dossier</span>
            <select value={user?.U_IsActive ? "true" : "false"} onChange={e => setUser({...user, U_IsActive: e.target.value === "true"})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white italic outline-none focus:border-blue-500 cursor-pointer">
              <option value="true">ACTIF (Habilité)</option>
              <option value="false">RÉVOQUÉ (Désactivé)</option>
            </select>
          </div>
        </div>

        <div className="mt-auto pt-10 border-t border-white/5 flex gap-6 items-center shrink-0">
          <div className="flex-1 flex items-center gap-4 text-slate-600">
             <Fingerprint size={24} />
             <div className="flex flex-col leading-none">
               <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">SDE Sig-System</span>
               <span className="text-[7px] italic">UUID Scellé : {id}</span>
             </div>
          </div>
          <button disabled={saving} type="submit" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-16 py-6 rounded-4xl font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-6 shadow-3xl cursor-pointer active:scale-95 text-white">
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={24} strokeWidth={3} /> Sceller le Dossier</>}
          </button>
        </div>
      </form>
    </div>
  );
}