/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📦 MODULE : REGISTRE DES TIERS (SDE)
 * -------------------------------------------------------------------------
 * FIX : UI PWA Ready (100dvh, retraits statiques).
 * DATE : 05 Mars 2026 | 00:10 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Truck, UserPlus, Search, Globe, Loader2, Mail, X, CheckCircle2 } from 'lucide-react';
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
      const res = await apiClient.get('/tiers').catch(() => ({ data: [] }));
      setTiers(res.data || []);
    } catch (err) { toast.error("Défaut de synchronisation du registre des Tiers."); }
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
      toast.success("Tiers enrôlé et scellé avec succès.", { id: tid });
    } catch (err) { toast.error("Erreur de scellage Kernel.", { id: tid }); }
  };

  const filtered = tiers.filter(t => t.TR_Name.toLowerCase().includes(search.toLowerCase()) || t.TR_CodeExterne?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} strokeWidth={3} />
      <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] m-0 animate-pulse">Indexation du registre...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between xl:items-end gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none m-0">
            Registre <span className="text-blue-500">Tiers</span>
          </h1>
          <div className="flex flex-wrap gap-4 mt-6 md:mt-8">
            <StatSmall count={tiers.length} label="Total Partenaires" color="blue" />
            <StatSmall count={tiers.filter(t => t.TR_Type === 'CLIENT').length} label="Portefeuille Clients" color="emerald" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto mt-4 xl:mt-0">
          <div className="relative flex-1 xl:w-80 font-sans">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              placeholder="Filtrer le registre..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl pl-12 pr-6 py-4 md:py-5 text-[10px] md:text-xs font-black outline-none focus:border-blue-500 transition-all uppercase italic text-white w-full shadow-inner placeholder:text-slate-600" 
            />
          </div>
          <button 
            onClick={() => setModal(true)} 
            className="w-full md:w-auto bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-xl shadow-blue-900/20 transition-all border-none cursor-pointer active:scale-95 flex items-center justify-center gap-3 shrink-0 m-0"
          >
            <UserPlus size={18} /> Nouveau Tiers
          </button>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8 w-full">
          {filtered.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[3rem] text-slate-500 text-xs font-black uppercase tracking-widest">
               Aucun partenaire ne correspond à vos critères.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((t) => (
                <div key={t.TR_Id} className="bg-[#0F172A]/80 border border-white/5 p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3.5rem] group relative overflow-hidden backdrop-blur-sm hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all duration-500 flex flex-col">
                  <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0B0F1A] rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0 shadow-inner">
                      <Truck size={24} className="md:w-7 md:h-7" />
                    </div>
                    <span className={`text-[8px] md:text-[9px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full border uppercase tracking-widest italic whitespace-nowrap ml-4 ${t.TR_Type === 'CLIENT' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-orange-400 border-orange-500/20 bg-orange-500/10'}`}>
                      {t.TR_Type}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none mb-3 group-hover:text-blue-400 transition-colors m-0 line-clamp-2">{t.TR_Name}</h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-6 md:mb-10 m-0">ID SYSTEM: {t.TR_CodeExterne || 'SANS_ID'}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4 pt-6 md:pt-8 border-t border-white/10 relative z-10 mt-auto">
                    <div className="flex items-center gap-3 text-slate-400 text-[9px] md:text-[10px] font-black italic uppercase tracking-widest truncate">
                      <Mail size={14} className="text-blue-500 shrink-0" /> {t.TR_Email || 'Contact non scellé'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[9px] md:text-[10px] font-black italic uppercase tracking-widest">
                      <Globe size={14} className="text-emerald-500 shrink-0" /> Écosystème SMI
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧾 MODAL SÉCURISÉE */}
      {modal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm bg-black/80 animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="relative bg-[#0F172A] border border-white/10 p-6 md:p-10 lg:p-14 rounded-[2.5rem] md:rounded-[4rem] w-full max-w-xl shadow-2xl text-left animate-in zoom-in-95 duration-500 font-sans flex flex-col max-h-[90vh]">
            <button type="button" onClick={() => setModal(false)} className="absolute top-6 md:top-10 right-6 md:right-10 text-slate-500 hover:text-rose-500 bg-transparent border-none cursor-pointer p-2 m-0"><X size={24} className="md:w-8 md:h-8" /></button>
            
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 shrink-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/40 text-white shrink-0"><UserPlus size={24} className="md:w-8 md:h-8" /></div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">Ajouter un <span className="text-blue-500">Tiers</span></h2>
            </div>
            
            <div className="space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1 pr-2">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Raison Sociale Officielle *</label>
                <input required placeholder="NOM DE L'ENTREPRISE" className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-xs md:text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase tracking-tighter shadow-inner placeholder:text-slate-600" value={form.TR_Name} onChange={e => setForm({...form, TR_Name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Nature Relation *</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-[10px] md:text-xs font-black text-blue-400 outline-none italic cursor-pointer shadow-inner appearance-none uppercase transition-colors focus:border-blue-500" value={form.TR_Type} onChange={e => setForm({...form, TR_Type: e.target.value})}>
                    <option value="CLIENT" className="bg-[#0B0F1A]">CLIENT</option>
                    <option value="FOURNISSEUR" className="bg-[#0B0F1A]">FOURNISSEUR</option>
                    <option value="PARTENAIRE" className="bg-[#0B0F1A]">PARTENAIRE</option>
                  </select>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Code Identité</label>
                  <input placeholder="EX: C-2026-001" className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase shadow-inner placeholder:text-slate-600" value={form.TR_CodeExterne} onChange={e => setForm({...form, TR_CodeExterne: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2 md:space-y-3 pb-4">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Email Contact</label>
                <input type="email" placeholder="CONTACT@PARTENAIRE.SN" className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase shadow-inner placeholder:text-slate-600" value={form.TR_Email} onChange={e => setForm({...form, TR_Email: e.target.value})} />
              </div>
            </div>

            <div className="pt-6 md:pt-8 shrink-0">
              <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-slate-900 py-5 md:py-7 rounded-2xl md:rounded-4xl font-black uppercase italic text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-blue-900/40 transition-all border-none cursor-pointer text-white active:scale-95 m-0">
                <CheckCircle2 size={18} className="md:w-5 md:h-5" /> Valider l&apos;Enrôlement
              </button>
            </div>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

function StatSmall({ count, label, color }: { count: number, label: string, color: 'blue' | 'emerald' }) {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center gap-3 md:gap-4 min-w-45 md:min-w-50 shadow-inner">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black italic border shrink-0 ${color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
        {count}
      </div>
      <div className="text-left min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1.5 md:mb-2 truncate m-0">{label}</p>
        <p className="text-[10px] md:text-xs font-black text-white uppercase italic leading-none m-0">Scellés</p>
      </div>
    </div>
  );
}