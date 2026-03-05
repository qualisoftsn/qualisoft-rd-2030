/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ANALYSEUR DE SEGMENT HIÉRARCHIQUE (§5.3)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse granulaire d'une Unité Organique SMI.
 * DESIGN : Cockpit 100dvh, Split-View Density, No-Scroll Global.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:45 GMT
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, ArrowLeft, ShieldCheck, MapPin, 
  RefreshCw, Briefcase, Network, Calendar} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function UnitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/org-units/${id}`);
      setUnit(res.data?.data || res.data);
    } catch { toast.error("NODE INTROUVABLE DANS LA MATRIX"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  if (loading) return <LoadingScreen label="Scan du Node Organisationnel..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER & NAVIGATION */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-xl z-50 mt-12 lg:mt-0">
        <button onClick={() => router.push("/dashboard/organization")} className="flex items-center gap-3 text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest mb-8 uppercase">
          <ArrowLeft size={16} /> Cockpit Architecture
        </button>
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4">
              <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest">{unit.OU_Type?.OUT_Label}</span>
              {unit.OU_IsActive && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-xl text-[9px] flex items-center gap-2 tracking-widest"><ShieldCheck size={12} /> Conforme §5.3</span>}
            </div>
            <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">{unit.OU_Name}</h1>
            <div className="flex items-center gap-6 text-[10px] text-slate-500 tracking-widest uppercase italic">
               <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {unit.OU_Site?.S_Name || 'NON DÉPLOYÉ'}</span>
               <span className="flex items-center gap-2"><Calendar size={14} /> Créé le {new Date(unit.OU_CreatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] transition-all border-none cursor-pointer italic font-black uppercase shadow-4xl text-white">Éditer Node Matrix</button>
        </div>
      </header>

      {/* 📊 KPI ROW */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-8">
         <NodeStat label="Citoyens Rattachés" val={unit.OU_Users?.length || 0} icon={Users} color="blue" />
         <NodeStat label="Périmètre Processus" val={unit.OU_Processus?.length || 0} icon={Briefcase} color="amber" />
         <NodeStat label="Nodes Enfants" val={unit.OU_Children?.length || 0} icon={Network} color="emerald" />
      </div>

      {/* 🧩 SPLIT VIEW (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="grid grid-cols-12 gap-8 pb-20">
          
          {/* Registre Équipe */}
          <section className="col-span-12 xl:col-span-4 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl flex flex-col gap-8 h-125">
             <h3 className="text-[11px] text-blue-500 tracking-[0.4em] m-0 italic flex items-center gap-3"><Users size={16} /> Registre Équipe</h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
               {unit.OU_Users?.map((u: any) => (
                 <div key={u.U_Id} className="bg-black/40 border border-white/5 p-5 rounded-3xl flex items-center gap-5 group cursor-pointer hover:border-blue-500/40 transition-all">
                    <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center font-black text-xs border border-blue-500/20">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                    <div className="text-left">
                       <p className="text-xs m-0 leading-none mb-1 text-white group-hover:text-blue-400">{u.U_FirstName} {u.U_LastName}</p>
                       <p className="text-[8px] text-slate-600 m-0 uppercase italic tracking-widest">{u.U_Role}</p>
                    </div>
                 </div>
               ))}
             </div>
          </section>

          {/* Maillage Processus */}
          <section className="col-span-12 xl:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl flex flex-col gap-8 h-125">
             <h3 className="text-[11px] text-amber-500 tracking-[0.4em] m-0 italic flex items-center gap-3"><Briefcase size={16} /> Maillage Processus</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-4">
                {unit.OU_Processus?.map((p: any) => (
                  <div key={p.PR_Id} className="bg-black/40 border border-white/5 p-8 rounded-[3.5rem] flex flex-col justify-between hover:border-amber-500/40 transition-all cursor-pointer group shadow-inner">
                     <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[8px] tracking-[0.2em] w-fit mb-6 italic">{p.PR_Code}</span>
                     <h4 className="text-2xl tracking-tighter leading-none m-0 group-hover:text-amber-500 transition-colors uppercase">{p.PR_Libelle}</h4>
                  </div>
                ))}
             </div>
          </section>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function NodeStat({ label, val, icon: Icon, color }: any) {
  const c: any = { blue: "text-blue-500", amber: "text-amber-500", emerald: "text-emerald-500" };
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3.5rem] flex items-center gap-8 shadow-4xl transition-all hover:-translate-y-1">
       <div className={cn("w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5", c[color])}><Icon size={28} /></div>
       <div className="text-left space-y-1">
          <p className="text-4xl font-black italic m-0 tracking-tighter leading-none text-white">{val}</p>
          <p className="text-[10px] text-slate-500 tracking-widest m-0 uppercase italic">{label}</p>
       </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}