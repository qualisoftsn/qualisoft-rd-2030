/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ✍️ MODULE : RECTIFICATION CHIRURGICALE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Édition des habilitations agent.
 * DESIGN : Isolated Form / Zero-Scroll / 100dvh.
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 23:45 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, ArrowLeft, Loader2, Shield, User, ShieldCheck, Lock, Fingerprint, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function EditUserPage() {
  const { id } = useParams() as any;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}`);
      setUser(res.data?.data || res.data);
    } catch { toast.error("Impossible d'extraire le dossier agent."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading("Scellage du dossier...");
    try {
      // FIX CHIRURGICAL : Extraction des IDs pour validation DTO stricte au Backend
      const payload = {
        U_FirstName: user.U_FirstName.toUpperCase(),
        U_LastName: user.U_LastName.toUpperCase(),
        U_Role: user.U_Role,
        U_IsActive: user.U_IsActive,
        U_SiteId: user.U_Site?.S_Id || user.U_SiteId,
        U_OrgUnitId: user.U_OrgUnit?.OU_Id || user.U_OrgUnitId
      };
      await apiClient.put(`/users/${id}`, payload);
      toast.success("DOSSIER AGENT SCELLÉ AU KERNEL.", { id: tid });
      setTimeout(() => router.push('/dashboard/users'), 1000);
    } catch { toast.error("ERREUR CRITIQUE : Payload rejeté par le Kernel.", { id: tid }); }
    finally { setSaving(false); }
  };

  if (loading) return <ViewLoader label="Lecture SDE Matrix §7.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex justify-between items-center mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <h1 className="text-3xl lg:text-4xl tracking-tighter leading-none m-0 italic flex items-center gap-4">
            <Shield className="text-blue-500" size={32} /> Rectification <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.5em] m-0">ID NOEUD : {id}</p>
        </div>
        <button onClick={() => router.push('/dashboard/users')} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-3 font-black text-[10px]">
          <ArrowLeft size={16} /> ANNUAIRE
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          <div className="space-y-8">
            <div className="bg-[#151A2D] p-10 rounded-[3.5rem] border border-white/5 space-y-10 shadow-4xl text-left">
               <h3 className="text-blue-500 text-[10px] tracking-widest flex items-center gap-3 m-0"><User size={18}/> Identité Civile</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Input label="Prénom" val={user.U_FirstName} onChange={(v:any)=>setUser({...user, U_FirstName:v})} />
                  <Input label="Nom" val={user.U_LastName} onChange={(v:any)=>setUser({...user, U_LastName:v})} />
               </div>
            </div>

            <div className="bg-[#151A2D] p-10 rounded-[3.5rem] border border-white/5 space-y-10 shadow-4xl text-left">
               <h3 className="text-emerald-500 text-[10px] tracking-widest flex items-center gap-3 m-0"><ShieldCheck size={18}/> Autorité & Statut</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Select label="Privilège Rôle" val={user.U_Role} onChange={(v:any)=>setUser({...user, U_Role:v})}>
                    <option value="USER">AGENT USER</option>
                    <option value="PILOTE">PILOTE PROCESSUS</option>
                    <option value="ADMIN">ADMINISTRATEUR</option>
                  </Select>
                  <Select label="Habilitation" val={user.U_IsActive ? "true" : "false"} onChange={(v:any)=>setUser({...user, U_IsActive:v==="true"})}>
                    <option value="true">HABILITÉ (ACTIF)</option>
                    <option value="false">RÉVOQUÉ (ARCHIVÉ)</option>
                  </Select>
               </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col">
            <div className="flex-1 bg-blue-600/5 rounded-[4rem] border-2 border-blue-500/20 p-16 flex flex-col justify-center relative overflow-hidden text-left">
               <Fingerprint className="absolute -right-10 -bottom-10 opacity-10" size={300} />
               <h3 className="text-3xl tracking-tighter font-black italic m-0 mb-6 flex items-center gap-4"><Lock className="text-blue-500"/> Empreinte SDE</h3>
               <p className="text-slate-400 text-sm font-bold uppercase italic leading-relaxed m-0">Ancrage Structurel : <span className="text-white">{user.U_Site?.S_Name || 'Master Root'}</span></p>
               <p className="text-[10px] text-slate-500 tracking-widest mt-8 uppercase font-bold opacity-40 m-0">Signature SHA-256 Verified §7.2</p>
            </div>
            <button type="submit" disabled={saving} className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black italic text-xs tracking-[0.4em] border-none cursor-pointer hover:bg-white hover:text-blue-600 shadow-4xl transition-all active:scale-95 flex items-center justify-center gap-4">
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> SCELLER LES MODIFICATIONS</>}
            </button>
          </div>
        </form>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- HELPERS ATOMIQUES SCELLÉS ---
function Input({ label, val, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <input value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 transition-all uppercase" />
    </div>
  );
}

function Select({ label, val, onChange, children }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}