/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { 
  Save, ArrowLeft, Loader2, Shield, User, Mail, ShieldCheck, 
  MapPin, Building, Fingerprint, Activity, Lock, Database, Info
} from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string; 
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 🛰️ CHARGEMENT DU DOSSIER
  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}`);
      const data = res.data?.data || res.data;
      if (!data) throw new Error("Introuvable");
      setUser(data);
    } catch (err) {
      try {
         const resAll = await apiClient.get('/users');
         const found = (resAll.data?.data || resAll.data || []).find((u: any) => u.U_Id === id);
         if (found) setUser(found);
         else toast.error("AGENT NON RÉPERTORIÉ.");
      } catch (e) {
        toast.error("RUPTURE LIAISON KERNEL.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // 🔐 SCELLAGE (Correction Erreur 400/404)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.U_FirstName || !user?.U_LastName) {
      toast.error("IDENTITÉ INCOMPLÈTE.");
      return;
    }

    setSaving(true);
    try {
      /**
       * 🚩 NETTOYAGE CHIRURGICAL (Fix 400 Bad Request)
       * Le Backend rejette les objets imbriqués. On n'envoie que les clés primaires.
       */
      const payload = {
        U_FirstName: user.U_FirstName.toUpperCase(),
        U_LastName: user.U_LastName.toUpperCase(),
        U_Role: user.U_Role,
        U_IsActive: user.U_IsActive,
        // On n'envoie pas tout l'objet Site/OrgUnit, juste les IDs si modifiés
        U_SiteId: user.U_Site?.S_Id || user.U_SiteId,
        U_OrgUnitId: user.U_OrgUnit?.OU_Id || user.U_OrgUnitId
      };

      // On tente le PUT souverain
      await apiClient.put(`/users/${id}`, payload);
      
      toast.success("HABILITATIONS SCELLÉES AVEC SUCCÈS");
      setTimeout(() => router.push('/dashboard/users'), 1000);
    } catch (error: any) {
      console.error("Erreur scellage:", error.response?.data);
      // Tentative de secours ultime via PATCH avec le même payload nettoyé
      try {
        await apiClient.patch(`/users/${id}`, {
          U_FirstName: user.U_FirstName.toUpperCase(),
          U_LastName: user.U_LastName.toUpperCase(),
          U_Role: user.U_Role,
          U_IsActive: user.U_IsActive
        });
        toast.success("SCELLAGE RÉUSSI (Via Patch)");
        setTimeout(() => router.push('/dashboard/users'), 1000);
      } catch (e) {
        toast.error("ERREUR CRITIQUE : Le Kernel rejette la structure des données.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse italic">Lecture SDE...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white p-6 italic font-sans flex flex-col overflow-hidden box-border">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 m-0 leading-none">
            <Shield className="text-blue-500" size={28} /> Habilitation <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 m-0 mt-1 italic leading-none">ISO 9001 §7.2 • ID: {id}</p>
        </div>
        <button onClick={() => router.push('/dashboard/users')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-[9px] font-black uppercase border border-white/10 px-4 py-2 rounded-xl bg-white/5 cursor-pointer">
          <ArrowLeft size={14} /> Annuaire
        </button>
      </header>

      <form onSubmit={handleUpdate} className="flex-1 bg-[#151A2D] border border-white/5 rounded-[2.5rem] p-8 shadow-4xl flex flex-col gap-6 overflow-hidden">
        
        <div className="grid grid-cols-3 gap-6 shrink-0">
          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-blue-500/50">
            <label className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-2 italic tracking-widest leading-none">
              <User size={14}/> Prénom (MAJ)
            </label>
            <input 
              value={user?.U_FirstName || ''} 
              onChange={e => setUser({...user, U_FirstName: e.target.value.toUpperCase()})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-blue-500/50">
            <label className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-2 italic tracking-widest leading-none">
              <User size={14}/> Nom (MAJ)
            </label>
            <input 
              value={user?.U_LastName || ''} 
              onChange={e => setUser({...user, U_LastName: e.target.value.toUpperCase()})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-emerald-500/50">
            <label className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-2 italic tracking-widest leading-none">
              <ShieldCheck size={14}/> Rôle Autorité SDE
            </label>
            <select 
              value={user?.U_Role || 'USER'} 
              onChange={e => setUser({...user, U_Role: e.target.value})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value="USER" className="bg-[#151A2D]">USER</option>
              <option value="PILOTE" className="bg-[#151A2D]">PILOTE</option>
              <option value="ADMIN" className="bg-[#151A2D]">ADMIN</option>
              <option value="SUPER_ADMIN" className="bg-[#151A2D]">SUPER ADMIN</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 shrink-0">
          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 opacity-80">
            <label className="text-[9px] font-black uppercase text-indigo-500 flex items-center gap-2 italic tracking-widest leading-none">
              <Lock size={14}/> Identifiant d&apos;Accès
            </label>
            <div className="flex items-center gap-3 text-slate-500 p-2 text-xs italic font-bold">
              <Mail size={16} className="text-slate-700" /> {user?.U_Email || 'N/A'}
              <span className="text-[6px] bg-white/5 px-2 py-1 rounded text-slate-600 uppercase border border-white/5">Lecture Seule</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-amber-500/50">
            <label className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-2 italic tracking-widest leading-none">
              <Activity size={14}/> Statut Dossier
            </label>
            <select 
              value={user?.U_IsActive ? "true" : "false"} 
              onChange={e => setUser({...user, U_IsActive: e.target.value === "true"})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value="true" className="bg-[#151A2D]">ACTIF (HABILITÉ)</option>
              <option value="false" className="bg-[#151A2D]">RÉVOQUÉ (DÉSACTIVÉ)</option>
            </select>
          </div>
        </div>

        <div className="flex-1 bg-black/20 rounded-4xl p-6 border border-white/5 flex flex-col justify-center gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 text-slate-500">
            <Building size={20} className="text-blue-500/50" />
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-600">Site d&apos;Ancrage</span>
              <span className="text-xs font-bold uppercase italic text-white">{user?.U_Site?.S_Name || 'Master Root'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Fingerprint size={20} className="text-blue-500/50" />
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Signature SDE</span>
              <span className="text-[9px] italic font-bold text-slate-600 tracking-tighter">{id}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <button 
            disabled={saving} 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 p-6 rounded-4xl font-black uppercase italic tracking-[0.5em] transition-all flex items-center justify-center gap-4 text-xs shadow-3xl active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} strokeWidth={3} /> Sceller le Dossier Agent</>}
          </button>
        </div>
      </form>

      <footer className="mt-3 flex justify-between items-center opacity-40 italic px-2 shrink-0">
          <div className="flex items-center gap-3">
            <Fingerprint size={24} className="text-blue-600" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-black uppercase tracking-widest text-white italic">SDE Matrix System</span>
              <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest leading-none">ISO 9001:2015 Compliant</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Info size={14} className="text-blue-500" />
             <span className="text-[7px] font-black uppercase text-blue-500 tracking-[0.3em]">Session Cryptée SDE Kernel</span>
          </div>
      </footer>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
}