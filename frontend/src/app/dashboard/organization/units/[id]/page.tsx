/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : FICHE DÉTAILLÉE DU NODE ORGANISATIONNEL
 * -------------------------------------------------------------------------
 * RÔLE : Analyseur de segment hiérarchique (Unité Organique).
 * CONFORMITÉ : §5.3 (Rôles, Responsabilités et Autorités) & §4.4 (SMI).
 * ARCHITECTURE : Zéro NextAuth • Correction de l'utilitaire `cn`.
 * DATE : 02 Mars 2026 | 12:34 GMT
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, ArrowLeft, ShieldCheck, 
  MapPin, ChevronRight, Activity, Target, AlertCircle,
  Calendar, FolderTree, ExternalLink, Briefcase, RefreshCw, 
  UserCircle, BadgeCheck, Network,
  Loader2
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

// Utilitaire Matrix Global (Fix du crash)
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- 🛡️ INTERFACES SCELLÉES SDE ---
interface UnitDetail {
  OU_Id: string;
  OU_Name: string;
  OU_Description?: string;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
  OU_Type: { OUT_Label: string; OUT_Code: string };
  OU_Site: { SI_Name: string; SI_Location: string };
  OU_Parent?: { OU_Id: string; OU_Name: string };
  OU_Manager?: { U_FirstName: string; U_LastName: string; U_Role: string };
  OU_Users: Array<{ U_Id: string; U_FirstName: string; U_LastName: string; U_Role: string }>;
  OU_Processus: Array<{ PR_Id: string; PR_Code: string; PR_Libelle: string }>;
  OU_Children: Array<{ OU_Id: string; OU_Name: string; OU_Type: string }>;
}

export default function UnitDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/org-units/${id}`);
      setUnit(res.data);
    } catch (err) {
      toast.error("NODE INTROUVABLE DANS LA MATRIX.");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const analytics = useMemo(() => {
    if (!unit || !unit.OU_CreatedAt) return { age: 0, coverage: 0 };
    const age = Math.floor((new Date().getTime() - new Date(unit.OU_CreatedAt).getTime()) / (1000 * 60 * 60 * 24));
    const coverage = unit.OU_Manager ? 100 : 0;
    return { age, coverage };
  }, [unit]);

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="font-black uppercase italic text-[10px] tracking-[0.4em] text-blue-500">Scan du node organisationnel...</p>
    </div>
  );

  if (!unit) return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] flex items-center justify-center p-8">
      <div className="bg-[#151A2D] rounded-[3rem] p-12 text-center border border-white/5 shadow-2xl max-w-md">
        <AlertCircle size={48} className="mx-auto mb-6 text-rose-500" />
        <h1 className="text-xl font-black uppercase italic text-white mb-6 tracking-tighter">Node Introuvable</h1>
        <Link href="/dashboard/organization" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] no-underline tracking-widest hover:bg-white hover:text-blue-600 transition-all">Retour Organisme</Link>
      </div>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] flex flex-col p-6 lg:p-10 italic font-sans text-left selection:bg-blue-600/30 overflow-hidden text-white">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🧭 FIL D'ARIANE TACTIQUE */}
      <nav className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500 mb-6 shrink-0">
        <Link href="/dashboard/organization" className="hover:text-blue-500 transition-colors no-underline text-slate-500">Organisme</Link>
        <ChevronRight size={12} />
        {unit.OU_Parent && (
          <>
            <button onClick={() => router.push(`/dashboard/organization/units/${unit.OU_Parent?.OU_Id}`)} className="hover:text-blue-500 border-none bg-transparent cursor-pointer font-black uppercase italic p-0 text-slate-500">{unit.OU_Parent.OU_Name}</button>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-white bg-white/10 px-3 py-1 rounded-lg border border-white/5">{unit.OU_Name}</span>
      </nav>

      {/* 💳 HEADER : IDENTITÉ DU NODE */}
      <header className="bg-[#151A2D] rounded-[3rem] p-8 lg:p-10 border border-white/5 shadow-2xl relative overflow-hidden mb-6 shrink-0 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Building2 size={150} /></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border border-blue-500/20 tracking-widest italic">{unit.OU_Type?.OUT_Label || 'SMI'}</span>
              <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border italic ${unit.OU_IsActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                {unit.OU_IsActive ? 'Actif' : 'Archivé'}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">{unit.OU_Name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-black text-[9px] uppercase italic">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {unit.OU_Site?.SI_Name || 'NON LOCALISÉ'}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-600" /> Opérationnel ({analytics.age}j)</span>
              <button onClick={fetchDetail} className="p-1.5 bg-white/5 rounded-lg hover:text-white transition-colors cursor-pointer border-none"><RefreshCw size={12}/></button>
            </div>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <button onClick={() => router.push(`/dashboard/organization/units/${id}/edit`)} className="flex-1 lg:flex-none px-6 py-4 bg-white/5 hover:bg-blue-600 hover:border-blue-500 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner">
              Modifier Node <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 KPI BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 shrink-0">
        <StatBadge icon={Users} label="Citoyens Rattachés" value={unit.OU_Users?.length || 0} color="blue" />
        <StatBadge icon={Briefcase} label="Périmètre Processus" value={unit.OU_Processus?.length || 0} color="amber" />
        <StatBadge icon={Network} label="Nodes Enfants" value={unit.OU_Children?.length || 0} color="emerald" />
      </div>

      {/* 🧩 GRILLE DE CONTENU */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* COLONNE A : REGISTRE ÉQUIPE */}
        <div className="w-full lg:w-[30%] bg-[#151A2D] p-6 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col min-h-0 backdrop-blur-md">
          <h3 className="text-[10px] font-black uppercase italic flex items-center gap-2 text-slate-400 tracking-[0.3em] mb-6 shrink-0">
            <Users size={16} className="text-blue-500" /> Registre Équipe
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {unit.OU_Users && unit.OU_Users.length > 0 ? unit.OU_Users.map((user) => (
              <div key={user.U_Id} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all group cursor-pointer shadow-inner">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 text-xs font-black border border-blue-500/20 leading-none">
                  {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase italic text-white truncate m-0 group-hover:text-blue-400">{user.U_FirstName} {user.U_LastName}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest truncate m-0 mt-1">{user.U_Role}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500" />
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                <Users size={32} className="mb-2" />
                <p className="text-[9px] font-black uppercase">Néant Collaborateur</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE B : MAILLAGE PROCESSUS & HIÉRARCHIE */}
        <div className="w-full lg:w-[70%] flex flex-col gap-6 min-h-0">
          
          <div className="shrink-0 bg-blue-900/20 border border-blue-500/20 p-8 rounded-[3rem] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-inner">
            <ShieldCheck className="text-blue-500/10 absolute -right-4 -bottom-4 pointer-events-none" size={120} />
            <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-400 shrink-0 border border-blue-500/30">
              <ShieldCheck size={28} />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2 m-0">Leadership & Clause §5.3</h4>
              <p className="text-xs font-bold text-slate-300 italic m-0 leading-relaxed">
                Le segment <span className="text-white font-black">{unit.OU_Name}</span> garantit l&apos;application des procédures et la surveillance des indicateurs rattachés à son périmètre opérationnel.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row gap-6 min-h-0">
            <div className="flex-1 bg-[#151A2D] p-6 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col min-h-0 backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase italic flex items-center gap-2 text-slate-400 tracking-[0.3em] mb-6 shrink-0">
                <Briefcase size={16} className="text-amber-500" /> Maillage Processus
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {unit.OU_Processus && unit.OU_Processus.length > 0 ? unit.OU_Processus.map((pr) => (
                  <div key={pr.PR_Id} className="p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-all group cursor-pointer shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg italic border border-amber-500/20">{pr.PR_Code}</span>
                      <ExternalLink size={14} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase italic text-white group-hover:text-amber-400 transition-colors m-0 leading-tight">{pr.PR_Libelle}</h4>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                    <Briefcase size={32} className="mb-2" />
                    <p className="text-[9px] font-black uppercase">Néant Processus</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full sm:w-[40%] bg-[#151A2D] p-6 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col min-h-0 backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase italic flex items-center gap-2 text-slate-400 tracking-[0.3em] mb-6 shrink-0">
                <FolderTree size={16} className="text-emerald-500" /> Sous-Unités
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {unit.OU_Children && unit.OU_Children.length > 0 ? unit.OU_Children.map((child) => (
                  <div key={child.OU_Id} onClick={() => router.push(`/dashboard/organization/units/${child.OU_Id}`)} className="p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between shadow-inner">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white uppercase italic truncate m-0 group-hover:text-emerald-400">{child.OU_Name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 m-0">{child.OU_Type}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400" />
                  </div>
                )) : (
                  <p className="text-[9px] font-black text-slate-600 text-center mt-10 uppercase italic opacity-50">Node Terminal (Pas d&apos;enfants)</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

/** 🧩 COMPOSANT : KPI BADGE SDE */
function StatBadge({ icon: Icon, label, value, color }: any) {
  const themes: any = { 
    blue: 'text-blue-400 bg-blue-600/10 border-blue-500/20', 
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20', 
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
  };

  return (
    <div className="flex items-center gap-5 p-6 bg-[#151A2D] rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-white/10 transition-all backdrop-blur-md">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 border", themes[color])}>
        <Icon size={24} />
      </div>
      <div className="text-left">
        <p className="text-3xl font-black text-white italic leading-none mb-1 tracking-tighter m-0">{value}</p>
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] italic leading-none m-0 mt-1">{label}</p>
      </div>
    </div>
  );
}