/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ✍️ MODULE : src/app/(dashboard)/users/[id]/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Édition chirurgicale des habilitations agent.
 * FONCTION : Nettoyage des payloads (Fix 400 Bad Request).
 * SÉCURITÉ : Zéro NextAuth. Master Data Synchronization.
 * DATE DE RÉVISION : 02 Mars 2026 | 16:15 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, ArrowLeft, Loader2, Shield, User, Mail, ShieldCheck, 
  Activity, Lock, Fingerprint
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}`);
      setUser(res.data?.data || res.data);
    } catch (err) {
      toast.error("Impossible d'extraire le dossier agent.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading("Scellage du dossier...");
    try {
      /**
       * 🚩 FIX CHIRURGICAL : On extrait uniquement les IDs
       * Le backend rejette les objets Site/OrgUnit complets (DTO strict).
       */
      const payload = {
        U_FirstName: user.U_FirstName.toUpperCase(),
        U_LastName: user.U_LastName.toUpperCase(),
        U_Role: user.U_Role,
        U_IsActive: user.U_IsActive,
        U_SiteId: user.U_Site?.S_Id || user.U_SiteId,
        U_OrgUnitId: user.U_OrgUnit?.OU_Id || user.U_OrgUnitId
      };

      await apiClient.put(`/users/${id}`, payload);
      toast.success("Dossier Agent scellé.", { id: tid });
      setTimeout(() => router.push('/dashboard/users'), 1000);
    } catch (error) {
      toast.error("Erreur critique : Le Kernel rejette la structure du payload.", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 italic">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse">Lecture SDE Matrix...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] text-white p-4 lg:p-8 italic font-sans flex flex-col overflow-hidden box-border text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter flex items-center gap-4 m-0 leading-none">
            <Shield className="text-blue-500" size={32} /> Habilitation <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 m-0 mt-2 italic leading-none truncate">ISO 9001 §7.2 • ID: {id}</p>
        </div>
        <button onClick={() => router.push('/dashboard/users')} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase border border-white/10 px-6 py-3 rounded-2xl bg-white/5 cursor-pointer m-0">
          <ArrowLeft size={16} /> Annuaire
        </button>
      </header>

      <form onSubmit={handleUpdate} className="flex-1 bg-[#151A2D] border border-white/5 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 shadow-4xl flex flex-col gap-8 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 shrink-0">
          <FormBlock label="Prénom" icon={User} color="blue">
            <input value={user?.U_FirstName || ''} onChange={e => setUser({...user, U_FirstName: e.target.value})} className="bg-transparent border-none p-0 text-lg font-black uppercase outline-none text-white w-full italic" required />
          </FormBlock>
          <FormBlock label="Nom" icon={User} color="blue">
            <input value={user?.U_LastName || ''} onChange={e => setUser({...user, U_LastName: e.target.value})} className="bg-transparent border-none p-0 text-lg font-black uppercase outline-none text-white w-full italic" required />
          </FormBlock>
          <FormBlock label="Rôle Autorité" icon={ShieldCheck} color="emerald">
            <select value={user?.U_Role || 'USER'} onChange={e => setUser({...user, U_Role: e.target.value})} className="bg-transparent border-none p-0 text-sm font-black text-white outline-none cursor-pointer uppercase italic w-full">
              <option value="USER" className="bg-[#151A2D]">USER</option>
              <option value="PILOTE" className="bg-[#151A2D]">PILOTE</option>
              <option value="ADMIN" className="bg-[#151A2D]">ADMIN</option>
            </select>
          </FormBlock>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 shrink-0">
          <FormBlock label="Identifiant Email" icon={Lock} color="indigo" disabled>
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold truncate"> {user?.U_Email || 'N/A'} </div>
          </FormBlock>
          <FormBlock label="Statut Dossier" icon={Activity} color="amber">
            <select value={user?.U_IsActive ? "true" : "false"} onChange={e => setUser({...user, U_IsActive: e.target.value === "true"})} className="bg-transparent border-none p-0 text-sm font-black text-white outline-none cursor-pointer uppercase italic w-full">
              <option value="true" className="bg-[#151A2D]">ACTIF (HABILITÉ)</option>
              <option value="false" className="bg-[#151A2D]">RÉVOQUÉ (DÉSACTIVÉ)</option>
            </select>
          </FormBlock>
        </div>

        <div className="flex-1 bg-black/20 rounded-[2.5rem] lg:rounded-[3rem] p-8 border border-white/5 flex flex-col justify-center gap-6 relative overflow-hidden group">
          <Fingerprint className="absolute -right-10 -bottom-10 text-white/2 group-hover:text-blue-500/5 transition-colors" size={300} />
          <p className="text-[10px] font-black uppercase text-blue-500 m-0 tracking-[0.3em] flex items-center gap-3"><Fingerprint size={16}/> Empreinte Dossier SDE</p>
          <div className="space-y-4">
             <p className="text-xs font-bold text-slate-500 m-0 uppercase italic">Ancrage : <span className="text-white">{user?.U_Site?.S_Name || 'Master Root'}</span></p>
             <p className="text-[9px] font-bold text-slate-700 m-0 uppercase tracking-widest leading-none">ID Matrix : {id}</p>
          </div>
        </div>

        <button disabled={saving} type="submit" className="shrink-0 w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-6 lg:py-8 rounded-3xl lg:rounded-[2.5rem] font-black uppercase italic tracking-[0.5em] transition-all flex items-center justify-center gap-4 text-xs lg:text-sm shadow-2xl active:scale-95 cursor-pointer border-none m-0">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} strokeWidth={3} /> Sceller les Modifications</>}
        </button>
      </form>
    </div>
  );
}

function FormBlock({ label, icon: Icon, color, children, disabled = false }: any) {
  const colors: any = { blue: "text-blue-500 focus-within:border-blue-500/50", emerald: "text-emerald-500 focus-within:border-emerald-500/50", amber: "text-amber-500 focus-within:border-amber-500/50", indigo: "text-indigo-500 focus-within:border-indigo-500/50" };
  return (
    <div className={`flex flex-col gap-4 p-6 lg:p-7 bg-white/5 rounded-4xl lg:rounded-[2.5rem] border border-white/5 transition-all ${colors[color]} ${disabled && "opacity-50 pointer-events-none"}`}>
      <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 m-0 leading-none">{Icon && <Icon size={14}/>} {label}</label>
      {children}
    </div>
  );
}