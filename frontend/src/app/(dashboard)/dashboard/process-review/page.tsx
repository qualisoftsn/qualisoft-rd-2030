/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : REGISTRE DES REVUES DE PROCESSUS (SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance de la performance (ISO 9001 §9.1.1).
 * DESIGN : Elite High-Density, 100dvh, Zero-Scroll Global, ClickUp UI.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:42 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Plus, ChevronRight, FileText, 
  ShieldCheck, Activity, 
  Calendar, Search, RefreshCw, Target} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ProcessReviewListPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/process-reviews');
      const data = res.data?.data || res.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      toast.error('RUPTURE DE FLUX : ÉCHEC DU CHARGEMENT DES REVUES');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const validated = reviews.filter(r => r.PRV_Status === 'VALIDEE' || r.PRV_Status === 'CLOTUREE').length;
    return { 
      total, 
      rate: total > 0 ? Math.round((validated / total) * 100) : 0,
      currentYear: reviews.filter(r => r.PRV_Year === new Date().getFullYear()).length
    };
  }, [reviews]);

  if (loading) return <LoadingScreen label="Synchronisation Matrix SDE..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-1 rounded-xl text-[9px] text-indigo-500 tracking-widest">ISO 9001 §9.1.1</span>
            <span className="text-emerald-500 text-[9px] tracking-widest">{stats.rate}% CONFORMITÉ</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Revues de <span className="text-indigo-600">Processus</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push('/dashboard/process-review/analytics')} className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer"><Activity size={20}/></button>
          <button onClick={() => router.push('/dashboard/process-review/preparation')} className="bg-indigo-600 hover:bg-white hover:text-indigo-600 px-10 py-5 rounded-3xl text-[10px] flex items-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 uppercase font-black tracking-widest">
            <Plus size={18} /> Nouvelle Revue
          </button>
        </div>
      </header>

      {/* 📊 KPI & SEARCH */}
      <div className="shrink-0 p-8 pb-4 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Taux de scellement" val={`${stats.rate}%`} icon={ShieldCheck} color="emerald" />
          <KPICard title="Sessions totales" val={stats.total} icon={FileText} color="blue" />
          <KPICard title="Exercice 2026" val={stats.currentYear} icon={Calendar} color="indigo" />
          <KPICard title="Audit Statut" val={stats.rate >= 80 ? 'OK' : 'FAIL'} icon={Target} color={stats.rate >= 80 ? 'emerald' : 'amber'} />
        </div>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-all" size={20} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER PAR PROCESSUS, RÉFÉRENCE OU ANNÉE..." className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-indigo-600 transition-all uppercase tracking-widest" />
        </div>
      </div>

      {/* 📋 WORKZONE (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl mb-10">
          <table className="w-full border-collapse">
            <thead className="bg-black/20 border-b border-white/5">
              <tr className="text-[10px] text-slate-500 tracking-[0.3em] font-black italic">
                <th className="p-8 text-left">Période</th>
                <th className="p-8 text-left">Processus Impacté</th>
                <th className="p-8 text-left">Référence SDE</th>
                <th className="p-8 text-left">Statut Matrix</th>
                <th className="p-8 text-right px-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.map((rev) => (
                <tr key={rev.PRV_Id} onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)} className="group hover:bg-white/5 transition-all cursor-pointer">
                  <td className="p-8">
                    <span className="bg-white/5 px-4 py-2 rounded-xl text-[11px] border border-white/5 group-hover:bg-indigo-600 transition-all">
                      {rev.PRV_Month.toString().padStart(2, '0')} / {rev.PRV_Year}
                    </span>
                  </td>
                  <td className="p-8">
                    <p className="text-lg m-0 leading-none group-hover:text-indigo-400 transition-colors uppercase italic">{rev.PRV_Processus?.PR_Libelle}</p>
                    <p className="text-[8px] text-slate-600 mt-2 m-0 tracking-widest font-black italic">{rev.PRV_Processus?.PR_Code || 'SDE-CORE'}</p>
                  </td>
                  <td className="p-8 text-[11px] font-bold text-slate-500 font-mono tracking-tighter">
                    {rev.PRV_DocRef || `PRV-${rev.PRV_Id.slice(0, 8)}`}
                  </td>
                  <td className="p-8">
                    <StatusBadge status={rev.PRV_Status} />
                  </td>
                  <td className="p-8 text-right px-12">
                    <ChevronRight size={24} className="text-slate-800 group-hover:text-white group-hover:translate-x-2 transition-all inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: any = {
    BROUILLON: "bg-slate-800 text-slate-400 border-white/5",
    EN_COURS: "bg-blue-600/10 text-blue-500 border-blue-500/20",
    VALIDEE: "bg-emerald-600/10 text-emerald-500 border-emerald-500/20",
    CLOTUREE: "bg-indigo-600/10 text-indigo-500 border-indigo-500/20"
  };
  return <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest italic", cfg[status])}>{status}</span>;
}

function KPICard({ title, val, icon: Icon, color }: any) {
  const c: any = { emerald: "text-emerald-500", blue: "text-blue-500", indigo: "text-indigo-500", amber: "text-amber-500" };
  return (
    <div className="bg-[#151B2B] p-7 rounded-[2.5rem] border-2 border-white/5 flex items-center gap-6 shadow-4xl transition-all hover:-translate-y-1">
      <div className={cn("p-4 bg-black/40 rounded-2xl border border-white/5", c[color])}><Icon size={24} /></div>
      <div className="text-left">
        <p className="text-3xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
        <p className="text-[9px] text-slate-500 tracking-widest mt-2 m-0 uppercase leading-none font-black italic">{title}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}