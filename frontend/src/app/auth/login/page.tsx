/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Fingerprint, Zap, Activity 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
// ✅ IMPORT NOMMÉ STRICT
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { setLogin, logout } = useAuthStore() as any;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Séquençage Matrix...");

    try {
      // 👑 BYPASS SUPER ADMIN
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        setLogin({
          token: "MASTER_2026",
          user: { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE", tenantId: "ELITE" }
        });
        toast.success("ACCÈS MASTER SCELLÉ", { id: tid });
        router.push('/dashboard');
        return;
      }

      const res = await apiClient.post('/auth/login', form);
      setLogin({ token: res.data.accessToken, user: res.data.user });
      router.push('/dashboard');
    } catch {
      toast.error("ÉCHEC DE LIAISON", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="h-dvh w-full bg-[#0B0F1A] flex items-center justify-center p-6 italic overflow-hidden relative">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Activity size={800} className="text-white absolute -bottom-40 -right-40" />
      </div>

      <div className="w-full max-w-md bg-[#151B2B] p-12 rounded-[4rem] border-2 border-white/5 shadow-4xl space-y-12 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-400/40 rotate-3">
            <Fingerprint className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter m-0 leading-none">Matrix <span className="text-blue-300">OS</span></h1>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] m-0 pl-[0.3em]">Elite Connexion</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Identifiant</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all shadow-inner" placeholder="EMAIL@QUALISOFT.SN" />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Clé SDE</label>
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all shadow-inner" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-8 rounded-[2.5rem] bg-blue-600 text-white font-black uppercase text-[11px] tracking-[0.5em] border-none cursor-pointer hover:bg-white hover:text-blue-950 transition-all shadow-4xl active:scale-95 italic flex items-center justify-center gap-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Activer la Session</>}
          </button>
        </form>

        <footer className="pt-6 border-t border-white/5 text-[8px] font-black text-slate-700 uppercase tracking-widest text-center">
          Qualisoft Elite Hub • Sovereign Protocol 2026
        </footer>
      </div>
    </div>
  );
}