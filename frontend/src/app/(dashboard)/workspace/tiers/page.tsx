'use client';

/**
 * 📦 MODULE : REGISTRE DES TIERS (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des Partenaires (Clients / Fournisseurs) du Tenant.
 * DESIGN : ClickUp 100dvh, Dark Matrix Design, Zero-Scroll Body.
 * DATE : 06 Mars 2026 | 01:50 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, UserPlus, Search, Globe, Mail, X, 
  CheckCircle2, Loader2, ChevronLeft, MoreHorizontal, Briefcase
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TiersRegistryPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/tiers');
      setTiers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Rupture de liaison avec le registre des Tiers.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du partenaire...");
    try {
      await apiClient.post('/tiers', form);
      setShowModal(false);
      setForm({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
      fetchData();
      toast.success("Tiers enrôlé avec succès.", { id: tid });
    } catch (err) { toast.error("Échec du scellage technique.", { id: tid }); }
  };

  const filtered = tiers.filter(t => 
    t.TR_Name?.toLowerCase().includes(query.toLowerCase()) || 
    t.TR_CodeExterne?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 EN-TÊTE SÉCURISÉ */}
      <header className="shrink-0 p-6 md:p-10 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-30 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/admin/setup" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors no-underline">
            <ChevronLeft size={14} /> Retour Workspace
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none m-0 italic">
            Registre <span className="text-blue-500">Tiers</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              placeholder="FILTRER LE REGISTRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-xs font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white"
              value={query} onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer active:scale-95"
          >
            <UserPlus size={20} /> Nouveau Tiers
          </button>
        </div>
      </header>

      {/* 📜 ZONE DE CONTENU (SCROLL LOCAL) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Indexation...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
            {filtered.map((t) => (
              <div key={t.TR_Id} className="bg-white/5 border border-white/5 p-8 rounded-[3rem] group hover:border-blue-500/50 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col h-full">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-16 h-16 bg-[#0B0F1A] border border-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <Truck size={28} />
                  </div>
                  <span className={`text-[9px] font-black px-4 py-2 rounded-full border uppercase tracking-widest italic ${t.TR_Type === 'CLIENT' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-orange-400 border-orange-500/20 bg-orange-500/10'}`}>
                    {t.TR_Type}
                  </span>
                </div>
                
                <div className="flex-1 space-y-4 relative z-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none m-0 group-hover:text-blue-400 transition-colors line-clamp-2">{t.TR_Name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic m-0">ID: {t.TR_CodeExterne || 'SANS_CODE'}</p>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 space-y-4 relative z-10">
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black italic uppercase tracking-widest truncate">
                    <Mail size={14} className="text-blue-500 shrink-0" /> {t.TR_Email || 'Email non scellé'}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black italic uppercase tracking-widest">
                    <Globe size={14} className="text-emerald-500 shrink-0" /> Écosystème SMI
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🧾 MODAL D'ENRÔLEMENT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="bg-[#0F172A] border border-white/10 p-8 md:p-14 rounded-[3.5rem] w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer transition-colors"><X size={32} /></button>
            
            <div className="flex items-center gap-6 mb-12 shrink-0">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 text-white"><UserPlus size={32} /></div>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter m-0 text-white">Enrôler un <span className="text-blue-500">Tiers</span></h2>
            </div>
            
            <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 flex-1">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">Raison Sociale Officielle *</label>
                <input required className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-sm font-black text-white italic uppercase outline-none focus:border-blue-600 transition-all" 
                  value={form.TR_Name} onChange={e => setForm({...form, TR_Name: e.target.value})} placeholder="NOM DE L'ENTREPRISE" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">Nature Relation *</label>
                  <select className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs font-black text-blue-400 italic outline-none cursor-pointer uppercase appearance-none" 
                    value={form.TR_Type} onChange={e => setForm({...form, TR_Type: e.target.value})}>
                    <option value="CLIENT">CLIENT</option>
                    <option value="FOURNISSEUR">FOURNISSEUR</option>
                    <option value="PARTENAIRE">PARTENAIRE</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">Identifiant Système</label>
                  <input className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs font-black text-white italic uppercase outline-none focus:border-blue-600 transition-all" 
                    value={form.TR_CodeExterne} onChange={e => setForm({...form, TR_CodeExterne: e.target.value})} placeholder="EX: C-2026-001" />
                </div>
              </div>
              <div className="space-y-3 pb-4">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">Email Contact</label>
                <input type="email" className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs font-black text-white italic uppercase outline-none focus:border-blue-600 transition-all" 
                  value={form.TR_Email} onChange={e => setForm({...form, TR_Email: e.target.value})} placeholder="CONTACT@PARTENAIRE.SN" />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] mt-10 transition-all active:scale-95 border-none cursor-pointer shrink-0">
              <CheckCircle2 size={18} className="inline mr-2" /> Valider l'Enrôlement
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}
