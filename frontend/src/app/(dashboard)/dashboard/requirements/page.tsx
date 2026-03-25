/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚖️ MODULE : REGULATORY REQUIREMENTS (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion centralisée des exigences légales (ISO 14001 / 45001 §6.1.3).
 * DESIGN : ClickUp High-Density, 100dvh, Full Responsive PWA.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT Sovereignty).
 * RECTIFICATION : Stabilité du typage de réponse (Ligne 46).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:45 GMT
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  Scale,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // --- 📡 SYNCHRONISATION KERNEL RECTIFIÉE ---
  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ FIX : Utilisation de <any> pour permettre le déballage sécurisé de l'enveloppe
      const res = await apiClient.get<any>('/requirements');
      
      // Déballage hybride (Supporte les formats [Data] ou { data: [Data] })
      const rawPayload = res.data;
      const finalData = Array.isArray(rawPayload) 
        ? rawPayload 
        : (Array.isArray(rawPayload?.data) ? rawPayload.data : []);

      setRequirements(finalData);
    } catch (err) {
      toast.error('RUPTURE DE FLUX : Échec de synchronisation réglementaire.');
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  // --- 📊 ANALYTICS EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const now = new Date();
    const limit30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      total: requirements.length,
      compliant: requirements.filter((r) => r.RR_Status === 'COMPLIANT').length,
      nonCompliant: requirements.filter((r) => r.RR_Status === 'NON_COMPLIANT').length,
      pending30d: requirements.filter((r) => {
        if (r.RR_Status === 'COMPLIANT') return false;
        const due = new Date(r.RR_DueDate);
        return due >= now && due <= limit30Days;
      }).length,
      complianceRate: requirements.length > 0
        ? Math.round((requirements.filter((r) => r.RR_Status === 'COMPLIANT').length / requirements.length) * 100)
        : 0,
    };
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requirements.filter((req) => {
      const matchText =
        req.RR_Title?.toLowerCase().includes(term) ||
        req.RR_Reference?.toLowerCase().includes(term) ||
        req.RR_Authority?.toLowerCase().includes(term);
      const matchCat = selectedCategory === 'ALL' || req.RR_Category === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || req.RR_Status === selectedStatus;
      return matchText && matchCat && matchStat;
    });
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  if (loading && requirements.length === 0) return <LoadingScreen label="Synchronisation Matrix §6.1.3..." />;

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/10 italic font-medium uppercase">
      <Toaster position="top-right" richColors theme="light" />

      {/* 🔝 HEADER CLICKUP COCKPIT */}
      <header className="shrink-0 p-6 lg:p-8 border-b border-slate-200 bg-white z-50">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black tracking-widest italic border-none">ISO 14001:2015 §6.1.3</span>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border border-emerald-100 italic">{stats.complianceRate}% CONFORMITÉ</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter m-0 leading-none">Veille <span className="text-indigo-600">Réglementaire</span></h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button className="flex-1 xl:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-[10px] font-black tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm italic cursor-pointer uppercase">
              <Download className="mr-3 h-4 w-4" /> Rapport Global
            </button>
            <button onClick={() => router.push('/dashboard/quality/requirements/nouveau')} className="flex-1 xl:flex-none inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-[10px] font-black tracking-widest text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all border-none italic cursor-pointer uppercase">
              <Plus className="mr-3 h-4 w-4" /> Nouvelle Exigence
            </button>
            <button onClick={fetchRequirements} className="p-4 bg-slate-100 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIStat title="Textes Référencés" value={stats.total.toString()} icon={FileText} color="blue" subtext="Base Documentaire" />
          <KPIStat title="Statut Conforme" value={stats.compliant.toString()} icon={CheckCircle2} color="emerald" subtext={`${stats.complianceRate}% du total`} />
          <KPIStat title="Échéances 30J" value={stats.pending30d.toString()} icon={Clock} color="amber" subtext="Critique / Urgent" />
          <KPIStat title="Non-Conformités" value={stats.nonCompliant.toString()} icon={AlertTriangle} color="red" subtext="Actions Requises" />
        </div>
      </header>

      {/* 🧭 NAVIGATION & FILTRES */}
      <div className="shrink-0 p-4 lg:px-8 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="FILTRER PAR TITRE, RÉFÉRENCE, AUTORITÉ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-[11px] font-black italic outline-none focus:bg-white focus:border-indigo-500 transition-all uppercase" />
        </div>
        <div className="flex gap-3">
          <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={['ALL', 'ENVIRONNEMENT', 'SÉCURITÉ', 'QUALITÉ', 'SOCIAL']} label="Catégorie" />
          <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'PENDING']} label="Statut" />
        </div>
      </div>

      {/* 📋 DATA STREAM */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 pb-20">
          {filteredRequirements.length > 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-8 py-5 text-left text-[9px] font-black text-slate-500 tracking-widest italic">Référence & Titre</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black text-slate-500 tracking-widest italic">Autorité</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black text-slate-500 tracking-widest italic">Priorité</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black text-slate-500 tracking-widest italic">Échéance</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black text-slate-500 tracking-widest italic">Statut</th>
                    <th className="px-6 py-5 text-right text-[9px] font-black text-slate-500 tracking-widest italic">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredRequirements.map((req) => (
                    <tr key={req.RR_Id} onClick={() => router.push(`/dashboard/quality/requirements/${req.RR_Id}`)} className="group cursor-pointer hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-6">
                        <div className="text-[13px] font-black text-slate-900 italic group-hover:text-indigo-600 leading-tight uppercase truncate max-w-md">{req.RR_Title}</div>
                        <div className="flex items-center gap-3 mt-1"><span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{req.RR_Reference}</span></div>
                      </td>
                      <td className="px-6 py-6"><span className="text-[11px] font-black text-slate-600 italic uppercase">{req.RR_Authority}</span></td>
                      <td className="px-6 py-6"><PriorityBadge priority={req.RR_Priority} /></td>
                      <td className="px-6 py-6 text-[11px] font-black text-slate-600 italic uppercase">{new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-6"><StatusBadge status={req.RR_Status} /></td>
                      <td className="px-6 py-6 text-right"><ChevronRight className="inline h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center opacity-60">
               <Scale className="h-16 w-16 mx-auto text-slate-300 mb-6" />
               <p className="text-xl font-black italic tracking-tighter uppercase">Référentiel non détecté</p>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 bg-white border-t border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-indigo-700 font-black text-[10px] tracking-widest uppercase italic"><ShieldCheck size={20} /> Compliance Matrix RD-2026 • Veille Légale Scellée</div>
        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{filteredRequirements.length} TEXTES SUR {requirements.length}</div>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- ATOMIQUES ---

function KPIStat({ title, value, icon: Icon, color, subtext }: any) {
  const configs: any = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600' };
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex items-center gap-5 group transition-all hover:border-indigo-100">
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-transparent transition-transform group-hover:scale-110 shadow-inner", configs[color])}><Icon size={28} /></div>
      <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest m-0">{title}</p><p className="text-3xl font-black text-slate-900 tracking-tighter m-0 italic">{value}</p><p className="text-[9px] font-black text-slate-500 uppercase italic m-0 mt-1">{subtext}</p></div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: any = { CRITICAL: 'bg-rose-600 text-white', HIGH: 'bg-orange-50 text-orange-700 border-orange-200', MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200', LOW: 'bg-slate-50 text-slate-600 border-slate-200' };
  return <span className={cn("inline-flex rounded-lg px-3 py-1 text-[9px] font-black uppercase italic tracking-widest border", config[priority] || config.MEDIUM)}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const config: any = { COMPLIANT: 'bg-emerald-50 text-emerald-700 border-emerald-100', NON_COMPLIANT: 'bg-red-50 text-red-700 border-red-100', PENDING: 'bg-amber-50 text-amber-700 border-amber-100' };
  return <span className={cn("inline-flex rounded-lg px-3 py-1 text-[9px] font-black uppercase italic tracking-widest border", config[status] || config.PENDING)}>{status?.replace('_', ' ')}</span>;
}

function FilterSelect({ value, onChange, options, label }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-[10px] font-black uppercase italic text-slate-600 outline-none focus:border-indigo-500 cursor-pointer appearance-none shadow-inner">
      <option value="ALL">TOUT : {label.toUpperCase()}</option>
      {options.filter((o: string) => o !== 'ALL').map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-8 lg:pl-72 text-indigo-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
