/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📦 MODULE : REGISTRE DES TIERS (SDE)
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 16:25 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Truck, UserPlus, Search, Globe, MoreHorizontal, Loader2, Building, Mail, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TierEntry { TR_Id: string; TR_Name: string; TR_Type: string; TR_Email?: string; TR_CodeExterne?: string; }

export default function TiersRegistryPage() {
  const [tiers, setTiers] = useState<TierEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/tiers');
      setTiers(res.data);
    } catch (err) { toast.error("Défaut du registre des Tiers."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Enregistrement du partenaire...");
    try {
      await apiClient.post('/tiers', form);
      setForm({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
      setModal(false);
      fetchTiers();
      toast.success("Tiers enrôlé avec succès.", { id: tid });
    } catch (err) { toast.error("Erreur de scellage.", { id: tid }); }
  };

  const filtered = tiers.filter(t => t.TR_Name.toLowerCase().includes(search.toLowerCase()) || t.TR_CodeExterne?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" size={50} /></div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30">
      <header className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 border-b border-white/5 pb-10 gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Registre <span className="text-blue-500 text-5xl">Tiers</span></h1>
          <div className="flex gap-6 mt-8">
            <StatSmall count={tiers.length} label="Total Partenaires" color="blue" />
            <StatSmall count={tiers.filter(t => t.TR_Type === 'CLIENT').length} label="Portefeuille Clients" color="emerald" />
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 font-sans">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input placeholder="Filtrer le registre..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-3xl pl-12 pr-6 py-4 text-xs font-black outline-none focus:border-blue-500 transition-all uppercase italic text-white w-full" />
          </div>
          <button onClick={() => setModal(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-3xl transition-all border-none cursor-pointer active:scale-95"><UserPlus size={18} /> Nouveau Tiers</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((t) => (
          <div key={t.TR_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] group relative overflow-hidden backdrop-blur-3xl hover:border-blue-500/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-10">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all"><Truck size={28} /></div>
              <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest italic ${t.TR_Type === 'CLIENT' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-orange-500 border-orange-500/20 bg-orange-500/5'}`}>{t.TR_Type}</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none mb-3 group-hover:text-blue-500 transition-colors">{t.TR_Name}</h3>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic mb-10">ID SYSTEM: {t.TR_CodeExterne || 'SANS_ID'}</p>
            <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black italic uppercase tracking-widest"><Mail size={14} className="text-blue-500" /> {t.TR_Email || 'Contact non scellé'}</div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black italic uppercase tracking-widest"><Globe size={14} className="text-emerald-500" /> Écosystème SMI</div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all" />
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-8 backdrop-blur-3xl bg-black/80">
          <form onSubmit={handleSubmit} className="relative bg-slate-900 border border-white/10 p-16 rounded-[4rem] w-full max-w-xl shadow-3xl text-left animate-in zoom-in-95 duration-500 font-sans">
            <button type="button" onClick={() => setModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={32} /></button>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-3xl shadow-blue-900/40 text-white"><UserPlus size={32} /></div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">Ajouter un <span className="text-blue-500">Tiers</span></h2>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Raison Sociale Officielle</label>
                <input required placeholder="NOM DE L'ENTREPRISE" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase tracking-tighter" value={form.TR_Name} onChange={e => setForm({...form, TR_Name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Nature Relation</label>
                  <select className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-xs font-black text-blue-500 outline-none italic cursor-pointer" value={form.TR_Type} onChange={e => setForm({...form, TR_Type: e.target.value})}>
                    <option value="CLIENT">CLIENT</option>
                    <option value="FOURNISSEUR">FOURNISSEUR</option>
                    <option value="PARTENAIRE">PARTENAIRE</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Code Identité</label>
                  <input placeholder="EX: C-2026-001" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase" value={form.TR_CodeExterne} onChange={e => setForm({...form, TR_CodeExterne: e.target.value})} />
                </div>
              </div>
              <div className="space-y-3 pb-8">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Email Certification / Contact</label>
                <input type="email" placeholder="CONTACT@PARTENAIRE.SN" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase" value={form.TR_Email} onChange={e => setForm({...form, TR_Email: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-7 rounded-4xl font-black uppercase italic text-xs tracking-[0.3em] flex items-center justify-center gap-4 shadow-3xl shadow-blue-900/40 transition-all border-none cursor-pointer text-white active:scale-95"><CheckCircle2 size={20} /> Valider l&apos;Enrôlement</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatSmall({ count, label, color }: { count: number, label: string, color: 'blue' | 'emerald' }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4 min-w-55">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic border ${color === 'blue' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20'}`}>{count}</div>
      <div className="text-left"><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">{label}</p><p className="text-xs font-black text-white uppercase italic leading-none">Scellés</p></div>
    </div>
  );
}