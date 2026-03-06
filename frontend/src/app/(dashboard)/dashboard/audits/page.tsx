/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : REGISTRE ET PLANIFICATION DES AUDITS (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage stratégique des missions d'audit (ISO 9001, 14001, 45001).
 * FIX : Layout ClickUp (Zéro Scroll Global), PWA Responsive, Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:10 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  ClipboardCheck, MapPin, Plus, Calendar, Loader2, FolderTree, FileText, ArrowRight, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES ---
interface Processus { PR_Id: string; PR_Libelle: string; }
interface Site { S_Id: string; S_Name: string; }
interface Audit {
  AU_Id: string; AU_Title: string; AU_Reference: string; AU_DateAudit: string;
  AU_Site?: Site; AU_Processus?: Processus; AU_Status: string;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    AU_Title: '', 
    AU_Reference: `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    AU_DateAudit: '', AU_Scope: '', AU_SiteId: '', AU_ProcessusId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAudits, resSites, resProcs] = await Promise.allSettled([
        apiClient.get('/audits'),
        apiClient.get('/sites'),
        apiClient.get('/processus')
      ]);

      if (resAudits.status === 'fulfilled') setAudits(resAudits.value.data?.data || resAudits.value.data || []);
      if (resSites.status === 'fulfilled') setSites(resSites.value.data?.data || resSites.value.data || []);
      if (resProcs.status === 'fulfilled') setProcesses(resProcs.value.data?.data || resProcs.value.data || []);
    } catch (err) { 
      toast.error("Échec de synchronisation du registre SDE."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tid = toast.loading("Scellement de la mission dans le plan annuel...");
    try {
      await apiClient.post('/audits', formData);
      toast.success("Audit programmé avec succès.", { id: tid });
      setFormData({ 
        AU_Title: '', AU_DateAudit: '', AU_SiteId: '', AU_ProcessusId: '', AU_Scope: '',
        AU_Reference: `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
      fetchData();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Erreur de programmation.", { id: tid }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && audits.length === 0) return (
    <div className="flex h-full items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase gap-4">
      <Loader2 className="animate-spin" size={40} /> Synchronisation du Plan d&apos;Audit...
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE */}
      <header className="shrink-0 p-6 md:p-8 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none m-0">
            Gestion des <span className="text-blue-500">Audits</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 m-0">
            SURVEILLANCE DU SYSTÈME DE MANAGEMENT INTÉGRÉ
          </p>
        </div>
        <button onClick={() => fetchData()} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none cursor-pointer hidden md:block">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* 📜 CONTENU PRINCIPAL (Split Layout ClickUp) */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* COLONNE GAUCHE : FORMULAIRE (Sticky-like via Flex) */}
        <aside className="w-full xl:w-96 p-6 md:p-8 bg-[#0F172A]/50 border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0">
          <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 m-0">
            <Plus className="text-blue-500" size={24} /> Planifier
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Titre de la mission</label>
              <input required placeholder="ex: Audit Interne Qualité" className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500 text-white transition-all shadow-inner" value={formData.AU_Title} onChange={e => setFormData({...formData, AU_Title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Date d&apos;audit</label>
              <input type="date" required className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500 text-white transition-all" value={formData.AU_DateAudit} onChange={e => setFormData({...formData, AU_DateAudit: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Processus Cible</label>
              <select required className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500 text-slate-400 cursor-pointer appearance-none" value={formData.AU_ProcessusId} onChange={e => setFormData({...formData, AU_ProcessusId: e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A]">{p.PR_Libelle}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Site concerné</label>
              <select required className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500 text-slate-400 cursor-pointer appearance-none" value={formData.AU_SiteId} onChange={e => setFormData({...formData, AU_SiteId: e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 mt-6 bg-blue-600 hover:bg-white hover:text-blue-900 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 border-none flex items-center justify-center gap-3">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={18} />} Programmer l&apos;Audit
            </button>
          </form>
        </aside>

        {/* COLONNE DROITE : REGISTRE DÉFILANT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12 bg-[#0B0F1A]">
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 m-0">
            <ClipboardCheck className="text-blue-500" size={32} /> Registre Souverain ({audits.length})
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {audits.length > 0 ? audits.map((audit) => (
              <div key={audit.AU_Id} className="p-6 md:p-8 bg-[#0F172A] rounded-4xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                  <div className="space-y-4">
                    <span className="text-[9px] font-black bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest">
                      REF: {audit.AU_Reference}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter m-0 group-hover:text-blue-400 transition-colors">
                      {audit.AU_Title}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge icon={<MapPin size={12}/>} text={audit.AU_Site?.S_Name || 'N/A'} />
                      <Badge icon={<FolderTree size={12}/>} text={audit.AU_Processus?.PR_Libelle || 'N/A'} />
                      <Badge icon={<Calendar size={12}/>} text={audit.AU_DateAudit ? new Date(audit.AU_DateAudit).toLocaleDateString('fr-FR') : 'Date non fixée'} />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Link href={`/dashboard/audits/${audit.AU_Id}/preuves`} className="flex-1 md:w-14 md:h-14 bg-[#0B0F1A] rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-inner" title="Collecter Preuves">
                      <FileText size={22} />
                    </Link>
                    <Link href={`/dashboard/audits/${audit.AU_Id}/rapport`} className="flex-2 md:px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3 hover:bg-white hover:text-blue-600 transition-all border-none no-underline">
                      Rapport <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-64 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 italic">
                <ClipboardCheck size={48} className="mb-4 opacity-20" />
                <p className="uppercase font-black text-xs tracking-widest m-0">Aucun audit planifié dans le SMI</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0F1A] border border-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest italic truncate max-w-37.5">
      <span className="text-blue-500 shrink-0">{icon}</span> {text}
    </div>
  );
}