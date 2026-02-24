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

  // 🛰️ CHARGEMENT DU DOSSIER AGENT
  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // On tente d'abord la route directe
      const res = await apiClient.get(`/users/${id}`);
      const data = res.data?.data || res.data;
      
      if (!data) throw new Error("Agent non trouvé");
      setUser(data);
    } catch (err) {
      console.warn("Fallback Matrix Search activé...");
      try {
         // Fallback : Recherche dans la liste globale si l'ID direct échoue
         const resAll = await apiClient.get('/users');
         const allUsers = resAll.data?.data || resAll.data || [];
         const found = allUsers.find((u: any) => u.U_Id === id);
         if (found) setUser(found);
         else toast.error("AGENT NON RÉPERTORIÉ DANS LA MATRICE.");
      } catch (e) {
        toast.error("RUPTURE DE LIAISON KERNEL : Impossible de charger le dossier.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // 🔐 SCELLAGE DES HABILITATIONS (Mise à jour)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Contrôle de conformité ISO 9001 §7.2
    if (!user?.U_FirstName || !user?.U_LastName || !user?.U_Role) {
      toast.error("CHAMPS OBLIGATOIRES MANQUANTS : Scellage impossible.");
      return;
    }

    setSaving(true);
    try {
      /**
       * 🚩 CORRECTION CRUCIALE : 
       * On teste la route standard, et si ton API utilise une route spécifique 
       * pour le scellage, on peut facilement l'ajuster ici.
       */
      await apiClient.put(`/users/${id}`, {
        ...user,
        U_FirstName: user.U_FirstName.toUpperCase(),
        U_LastName: user.U_LastName.toUpperCase()
      });
      
      toast.success("DOSSIER AGENT SCELLÉ : Matrice RACI mise à jour.");
      setTimeout(() => router.push('/dashboard/users'), 1200);
    } catch (error: any) {
      console.error("Erreur scellage:", error);
      // Si l'erreur est une 404, on tente une route alternative commune dans votre architecture
      if (error.response?.status === 404) {
         try {
            await apiClient.patch(`/users/${id}`, user);
            toast.success("SCELLAGE RÉUSSI (Via Patch)");
            setTimeout(() => router.push('/dashboard/users'), 1200);
            return;
         } catch (e) {
            toast.error("ERREUR CRITIQUE 404 : La route de mise à jour est introuvable sur le serveur.");
         }
      } else {
        toast.error("ERREUR DE SCELLAGE : Le Kernel a rejeté la mise à jour.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse italic text-center">
        SYNCHRONISATION SDE EN COURS...
      </span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white p-6 italic font-sans flex flex-col overflow-hidden box-border">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER SOUVERAIN */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 m-0 leading-none">
            <Shield className="text-blue-500" size={28} /> Habilitation <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 m-0 mt-1 italic leading-none">Qualification §7.2 • Certificat : {id}</p>
        </div>
        <button onClick={() => router.push('/dashboard/users')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-[9px] font-black uppercase border border-white/10 px-6 py-3 rounded-xl bg-white/5 cursor-pointer shadow-lg active:scale-95">
          <ArrowLeft size={14} /> Retour Annuaire
        </button>
      </header>

      {/* 🛠️ FORMULAIRE HIGH-DENSITY */}
      <form onSubmit={handleUpdate} className="flex-1 bg-[#151A2D] border border-white/5 rounded-[2.5rem] p-8 shadow-4xl flex flex-col gap-6 overflow-hidden">
        
        {/* GRILLE D'IDENTITÉ (MAJUSCULES FORCÉES) */}
        <div className="grid grid-cols-3 gap-6 shrink-0">
          
          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-blue-500/50">
            <label className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-2 italic tracking-widest leading-none">
              <User size={14}/> Prénom (MAJ)
            </label>
            <input 
              value={user?.U_FirstName || ''} 
              onChange={e => setUser({...user, U_FirstName: e.target.value.toUpperCase()})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
              required
              placeholder="PRÉNOM DE L'AGENT"
            />
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-blue-500/50">
            <label className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-2 italic tracking-widest leading-none">
              <User size={14}/> Nom (MAJ)
            </label>
            <input 
              value={user?.U_LastName || ''} 
              onChange={e => setUser({...user, U_LastName: e.target.value.toUpperCase()})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
              required
              placeholder="NOM DE FAMILLE"
            />
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5">
            <label className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-2 italic tracking-widest leading-none">
              <ShieldCheck size={14}/> Rôle Autorité SDE
            </label>
            <select 
              value={user?.U_Role || 'USER'} 
              onChange={e => setUser({...user, U_Role: e.target.value})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold text-white outline-none cursor-pointer appearance-none"
            >
              <option value="USER" className="bg-[#151A2D]">USER (Accès Standard)</option>
              <option value="PILOTE" className="bg-[#151A2D]">PILOTE (Process Owner)</option>
              <option value="ADMIN" className="bg-[#151A2D]">ADMIN (Tenant)</option>
              <option value="SUPER_ADMIN" className="bg-[#151A2D]">SUPER ADMIN (Matrix)</option>
            </select>
          </div>
        </div>

        {/* SECTION SÉCURITÉ & STATUT */}
        <div className="grid grid-cols-2 gap-6 shrink-0">
          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 opacity-80">
            <label className="text-[9px] font-black uppercase text-indigo-500 flex items-center gap-2 italic tracking-widest leading-none">
              <Lock size={14}/> Identifiant d&apos;Accès Scellé
            </label>
            <div className="flex items-center gap-3 text-slate-500 p-2 text-xs italic font-bold">
              <Mail size={16} className="text-slate-700" /> {user?.U_Email || 'N/A'}
              <span className="text-[6px] bg-white/5 px-2 py-1 rounded text-slate-600 uppercase border border-white/5 tracking-tighter">Lecture Seule</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 bg-white/5 rounded-3xl border border-white/5 transition-all focus-within:border-amber-500/50">
            <label className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-2 italic tracking-widest leading-none">
              <Activity size={14}/> Statut Dossier Agent
            </label>
            <select 
              value={user?.U_IsActive ? "true" : "false"} 
              onChange={e => setUser({...user, U_IsActive: e.target.value === "true"})} 
              className="bg-transparent border-b border-white/10 p-2 text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value="true" className="bg-[#151A2D]">HABILITÉ (ACTIF)</option>
              <option value="false" className="bg-[#151A2D]">RÉVOQUÉ (DÉSACTIVÉ)</option>
            </select>
          </div>
        </div>

        {/* MASTER DATA BOX */}
        <div className="flex-1 bg-black/20 rounded-4xl p-6 border border-white/5 flex flex-col justify-center gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] rotate-12">
            <Database size={200} />
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Building size={20} className="text-blue-600/50" />
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] font-black uppercase text-slate-600">Site &apos;Agent</span>
              <span className="text-xs font-bold uppercase italic text-white">{user?.U_Site?.S_Name || 'Master Root Cluster'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Fingerprint size={20} className="text-blue-600/50" />
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">QS Unique SDE</span>
              <span className="text-[9px] italic font-bold text-slate-600 tracking-tighter">{id}</span>
            </div>
          </div>
        </div>

        {/* ACTION DE SCELLAGE */}
        <div className="shrink-0">
          <button 
            disabled={saving} 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 p-6 rounded-4xl font-black uppercase italic tracking-[0.5em] transition-all flex items-center justify-center gap-4 text-xs shadow-3xl active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} strokeWidth={3} /> Valider Agent</>}
          </button>
        </div>
      </form>

      {/* FOOTER SOUVERAIN */}
      <footer className="mt-3 flex justify-between items-center opacity-40 italic px-2 shrink-0">
          <div className="flex items-center gap-3">
            <Fingerprint size={24} className="text-blue-600" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-black uppercase tracking-widest text-white">QS SDE Matrix</span>
              <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">ISO 9001:2015 Compliant</span>
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