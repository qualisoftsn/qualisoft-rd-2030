/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : REGISTRE ET PLANIFICATION DES AUDITS
 * -------------------------------------------------------------------------
 * RÔLE : Centre de pilotage pour la création et le suivi des audits.
 * FIX : Remplacement des alert() par Sonner, ajout du Toaster, sécurisation 
 * des payloads API et amélioration du Responsive Design.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:24 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  ClipboardCheck, MapPin, Plus, Calendar, Loader2, FolderTree, FileText, ArrowRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRICTES ---
interface Processus { PR_Id: string; PR_Libelle: string; }
interface Site { S_Id: string; S_Name: string; }
interface User { U_Id: string; U_FirstName: string; U_LastName: string; }
interface Audit {
  AU_Id: string; AU_Title: string; AU_Reference: string; AU_DateAudit: string;
  AU_Site?: Site; AU_Processus?: Processus;
}
interface AuditFormData {
  AU_Title: string; AU_Reference: string; AU_DateAudit: string; AU_Scope: string;
  AU_LeadId: string; AU_SiteId: string; AU_ProcessusId: string;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<AuditFormData>({
    AU_Title: '', 
    AU_Reference: `AUD-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
    AU_DateAudit: '', AU_Scope: '', AU_LeadId: '', AU_SiteId: '', AU_ProcessusId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAudits, resSites, resProcs] = await Promise.allSettled([
        apiClient.get('/audits'),
        apiClient.get('/sites'),
        apiClient.get('/processus')
      ]);

      if (resAudits.status === 'fulfilled') {
        const data = resAudits.value.data?.data || resAudits.value.data;
        setAudits(Array.isArray(data) ? data : []);
      }
      if (resSites.status === 'fulfilled') {
        const data = resSites.value.data?.data || resSites.value.data;
        setSites(Array.isArray(data) ? data : []);
      }
      if (resProcs.status === 'fulfilled') {
        const data = resProcs.value.data?.data || resProcs.value.data;
        setProcesses(Array.isArray(data) ? data : []);
      }
    } catch (err) { 
      toast.error("Erreur de synchronisation avec le registre des audits."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tid = toast.loading("Planification de l'audit en cours...");
    try {
      await apiClient.post('/audits', formData);
      setFormData({ 
        ...formData, 
        AU_Title: '', AU_DateAudit: '', AU_SiteId: '', AU_ProcessusId: '',
        AU_Reference: `AUD-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`
      });
      toast.success("Audit programmé avec succès.", { id: tid });
      fetchData();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Erreur de programmation de l'audit.", { id: tid }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && audits.length === 0) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase gap-4">
      <Loader2 className="animate-spin" size={40} /> Analyse du Plan d&apos;Audit...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white italic font-sans text-left selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="mb-10 lg:mb-12 border-b-2 border-white/5 pb-8 mt-12 lg:mt-0">
        <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
          Gestion des <span className="text-blue-500">Audits</span>
        </h1>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 m-0">
          Surveillance du Système de Management Intégré
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* COLONNE GAUCHE : PLANIFICATION */}
        <div className="xl:col-span-1 bg-slate-900/40 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 shadow-2xl h-fit xl:sticky top-10">
          <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 m-0">
            <Plus className="text-blue-500" size={24} /> Planifier
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              required 
              placeholder="Titre de l'audit" 
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-white transition-colors" 
              value={formData.AU_Title} 
              onChange={e => setFormData({...formData, AU_Title: e.target.value})} 
            />
            <input 
              type="date" 
              required 
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-white transition-colors" 
              value={formData.AU_DateAudit} 
              onChange={e => setFormData({...formData, AU_DateAudit: e.target.value})} 
            />
            <select 
              required 
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-slate-400 cursor-pointer transition-colors"
              value={formData.AU_ProcessusId} 
              onChange={e => setFormData({...formData, AU_ProcessusId: e.target.value})}
            >
              <option value="">-- Processus Cible --</option>
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A]">{p.PR_Libelle}</option>)}
            </select>
            <select 
              required 
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-xs font-bold outline-none focus:border-blue-500 text-slate-400 cursor-pointer transition-colors"
              value={formData.AU_SiteId} 
              onChange={e => setFormData({...formData, AU_SiteId: e.target.value})}
            >
              <option value="">-- Site Audité --</option>
              {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
            </select>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 mt-4 bg-linear-to-r from-blue-600 to-blue-800 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 border-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
              {isSubmitting ? "Programmation..." : "Programmer l'Audit"}
            </button>
          </form>
        </div>

        {/* COLONNE DROITE : REGISTRE */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 text-white m-0">
            <ClipboardCheck className="text-blue-500" size={28} /> Registre ({audits.length})
          </h2>
          
          {audits.length === 0 ? (
             <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
               <ClipboardCheck size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
               <p className="text-slate-500 font-black uppercase tracking-widest text-xs m-0">Aucun audit planifié</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {audits.map((audit) => (
                <div key={audit.AU_Id} className="p-6 lg:p-8 bg-slate-900/40 rounded-[2.5rem] border-2 border-white/5 group hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-900/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                    <div>
                      <span className="text-[9px] font-black bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase italic tracking-widest">
                        Réf: {audit.AU_Reference}
                      </span>
                      <h3 className="text-2xl font-black uppercase italic mt-4 tracking-tighter text-white m-0 leading-tight group-hover:text-blue-300 transition-colors">
                        {audit.AU_Title}
                      </h3>
                    </div>
                    <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                      <Link 
                        href={`/dashboard/audits/${audit.AU_Id}/preuves`} 
                        className="flex-1 sm:flex-none p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white shadow-inner transition-all cursor-pointer flex items-center justify-center no-underline border border-white/5" 
                        title="Collecter Preuves"
                      >
                        <FileText size={20} />
                      </Link>
                      <Link 
                        href={`/dashboard/audits/${audit.AU_Id}/rapport`} 
                        className="flex-1 sm:flex-none px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all cursor-pointer flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest no-underline border-none"
                      >
                        Rapport <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-black/20 p-3 rounded-xl">
                      <MapPin size={16} className="text-blue-500 shrink-0"/>
                      <span className="truncate">{audit.AU_Site?.S_Name || 'Non défini'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-black/20 p-3 rounded-xl">
                      <FolderTree size={16} className="text-blue-500 shrink-0"/>
                      <span className="truncate">{audit.AU_Processus?.PR_Libelle || 'Non défini'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-black/20 p-3 rounded-xl">
                      <Calendar size={16} className="text-blue-500 shrink-0"/>
                      {audit.AU_DateAudit ? new Date(audit.AU_DateAudit).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}