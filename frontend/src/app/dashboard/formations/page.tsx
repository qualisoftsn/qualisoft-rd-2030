/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  GraduationCap, Plus, Search, Activity, AlertCircle, 
  ShieldCheck, X, Save, Loader2, BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fRes, uRes] = await Promise.all([
        apiClient.get('/formations'),
        apiClient.get('/users')
      ]);
      setFormations(fRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      toast.error("ERREUR DE SYNCHRONISATION GPEC");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase">
       <Activity className="animate-spin mr-3" size={24} /> INITIALISATION GPEC...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col uppercase font-black relative overflow-hidden">
      
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A] sticky top-0 z-50">
        <div>
          <h1 className="text-3xl tracking-tighter italic font-black uppercase">PLAN <span className="text-blue-600">GPEC</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] flex items-center gap-2 mt-1 italic">
            <ShieldCheck size={12} className="text-emerald-500" /> ISO 9001 §7.2
          </p>
        </div>
        <div className="flex gap-4">
          <input 
            placeholder="RECHERCHER..." 
            className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] outline-none focus:border-blue-600 w-64 italic font-black"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl text-[10px] flex items-center gap-2 active:scale-95 shadow-2xl transition-all"
          >
            <Plus size={16} strokeWidth={3} /> PLANIFIER
          </button>
        </div>
      </header>

      <main className="p-10 flex-1 overflow-y-auto">
        <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/2 flex items-center gap-3">
             <BookOpen size={18} className="text-blue-500" />
             <h3 className="text-[11px] tracking-widest italic uppercase font-black">REGISTRE DES HABILITATIONS</h3>
          </div>
          <table className="w-full text-left">
            <thead className="text-[9px] text-slate-600 border-b border-white/5 uppercase italic">
              <tr>
                <th className="p-8">COLLABORATEUR</th>
                <th className="p-8">FORMATION / TITRE</th>
                <th className="p-8 text-right">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {formations.filter(f => (f.FOR_Title || "").toLowerCase().includes(search.toLowerCase())).map((f) => (
                <tr key={f.FOR_Id} className="hover:bg-blue-600/5 transition-all">
                  <td className="p-8 font-black">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</td>
                  <td className="p-8 italic uppercase">{f.FOR_Title}</td>
                  <td className="p-8 text-right font-black text-blue-500">{f.FOR_Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* 🚀 MODALE DE SAISIE CORRIGÉE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <form 
            onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              
              setLoading(true);
              const tid = toast.loading("ENREGISTREMENT GPEC...");
              try {
                await apiClient.post('/formations', data);
                toast.success("SESSION PLANIFIÉE", { id: tid });
                setIsModalOpen(false);
                fetchData();
              } catch (err: any) { 
                toast.error(err.response?.data?.message?.[0] || "ERREUR DE SAISIE", { id: tid }); 
              } finally { setLoading(false); }
            }} 
            className="bg-[#0F172A] w-full max-w-lg rounded-[3rem] border border-white/10 p-12 space-y-8 shadow-4xl"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
               <h2 className="text-2xl italic font-black uppercase leading-none italic">NOUVELLE <span className="text-blue-600">SESSION</span></h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors"><X size={28}/></button>
            </div>

            <div className="space-y-6 text-left font-black italic">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-2">INTITULÉ FORMATION *</label>
                <input required name="FOR_Title" className="bg-white/5 border border-white/10 p-5 rounded-xl text-[12px] text-white outline-none focus:border-blue-600 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-2">COLLABORATEUR *</label>
                  <select required name="FOR_UserId" className="bg-white/5 border border-white/10 p-5 rounded-xl text-[11px] text-white outline-none cursor-pointer">
                    <option value="">SÉLECTIONNER</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A]">{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-2">DATE PRÉVUE *</label>
                  <input required name="FOR_Date" type="date" className="bg-white/5 border border-white/10 p-5 rounded-xl text-[11px] text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-2">EXPIRATION</label>
                  <input name="FOR_Expiry" type="date" className="bg-white/5 border border-white/10 p-5 rounded-xl text-[11px] text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-2">ORGANISME *</label>
                  <select required name="FOR_Provider" className="bg-white/5 border border-white/10 p-5 rounded-xl text-[11px] text-white outline-none cursor-pointer">
                    <option value="INTERNE">INTERNE</option>
                    <option value="BUREAU VERITAS">BUREAU VERITAS</option>
                    <option value="APAVE">APAVE</option>
                    <option value="SGS">SGS</option>
                    <option value="AUTRE">AUTRE (PRÉCISER EN TITRE)</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 py-8 rounded-2xl font-black text-[11px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl disabled:opacity-50">
               {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} VALIDER L&apos;INSCRIPTION
            </button>
          </form>
        </div>
      )}
    </div>
  );
}