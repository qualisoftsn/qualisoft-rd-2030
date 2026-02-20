/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, ArrowLeft, ShieldCheck, 
  MapPin, ChevronRight, Activity, Target, AlertCircle,
  Calendar, FolderTree, ExternalLink,
  Briefcase
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function UnitDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [unit, setUnit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /** 📡 RÉCUPÉRATION DU PROFIL DE L'UNITÉ */
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/org-units/${id}`);
        setUnit(res.data);
      } catch (err) {
        toast.error("Unité introuvable ou erreur réseau");
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  /** 📊 ANALYSEUR STATISTIQUE RÉCURSIF */
  const stats = useMemo(() => {
    if (!unit) return null;
    return {
      users: unit.OU_Users?.length || 0,
      processes: unit.OU_Processus?.length || 0,
      age: Math.floor((new Date().getTime() - new Date(unit.OU_CreatedAt).getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [unit]);

  if (loading) return <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6 animate-pulse"><Activity className="animate-spin text-blue-600" size={50} /><p className="font-black uppercase italic text-[10px] tracking-[0.4em] text-slate-400">Scan du node organisationnel...</p></div>;

  if (!unit) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8"><div className="bg-white rounded-[4rem] p-16 text-center border border-slate-100 shadow-xl max-w-md"><AlertCircle size={64} className="mx-auto mb-8 text-red-500" /><h1 className="text-2xl font-black uppercase italic mb-6">Unité introuvable</h1><Link href="/dashboard/organization/chart" className="inline-flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] border-none">RETOUR ORGANISME</Link></div></div>;

  return (
    <div className="p-6 lg:p-12 space-y-10 bg-slate-50 min-h-screen italic font-sans text-left selection:bg-blue-100">
      
      {/* 🧭 FIL D'ARIANE (BREADCRUMB) */}
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-wrap text-left">
        <Link href="/dashboard/organization/chart" className="hover:text-blue-600 transition-colors italic">ORGANIGRAMME</Link>
        <ChevronRight size={14} />
        {unit.OU_Parent && <><button onClick={() => router.push(`/dashboard/organization/units/${unit.OU_Parent.OU_Id}`)} className="hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer font-black uppercase italic truncate max-w-50">{unit.OU_Parent.OU_Name}</button><ChevronRight size={14} /></>}
        <span className="text-slate-900 truncate max-w-75">{unit.OU_Name}</span>
      </div>

      {/* 💳 FICHE D'IDENTITÉ UNITÉ */}
      <div className="bg-white rounded-[4rem] p-10 lg:p-16 shadow-3xl border border-slate-100 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-16 opacity-5"><Building2 size={250} /></div>
        <div className="relative z-10 text-left">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 text-left">
            <div className="space-y-5 text-left">
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full italic shadow-xl">{unit.OU_Type?.OUT_Label}</span>
                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${unit.OU_IsActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{unit.OU_IsActive ? 'Actif' : 'Archivé'}</span>
              </div>
              <h1 className="text-5xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none text-left">{unit.OU_Name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-black text-[10px] uppercase italic text-left">
                <span className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl"><MapPin size={16} className="text-blue-500" /> {unit.OU_Site?.S_Name}</span>
                <span className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl"><Calendar size={16} /> Opérationnel depuis {stats?.age} jours</span>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/organization/units/${id}/edit`)} className="px-8 py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 border-none cursor-pointer">MODIFIER LA STRUCTURE <ExternalLink size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 text-left">
            <StatBadge icon={Users} label="Collaborateurs" value={stats?.users || 0} color="blue" />
            <StatBadge icon={Briefcase} label="Processus SMI" value={stats?.processes || 0} color="amber" />
            <StatBadge icon={FolderTree} label="Sous-Unités" value={unit.OU_Children?.length || 0} color="emerald" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
        
        {/* COLONNE EFFECTIFS */}
        <div className="lg:col-span-1 text-left">
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl text-left">
            <h3 className="text-sm font-black uppercase italic flex items-center gap-3 text-slate-900 tracking-tighter border-b pb-6 border-slate-50 text-left">
              <Users size={24} className="text-blue-600" /> Registre Équipe
            </h3>
            <div className="space-y-4 mt-8 text-left">
              {unit.OU_Users?.length ? unit.OU_Users.map((user: any) => (
                <div key={user.U_Id} className="flex items-center gap-5 p-5 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-blue-300 hover:bg-white transition-all group cursor-pointer text-left">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-base font-black group-hover:bg-blue-600 transition-colors shadow-lg leading-none">{user.U_FirstName[0]}{user.U_LastName[0]}</div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-black uppercase italic text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors truncate">{user.U_FirstName} {user.U_LastName}</p>
                    <p className="text-[9px] font-black text-blue-500 uppercase italic tracking-widest truncate">{user.U_Role}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                </div>
              )) : <div className="py-20 text-center opacity-30"><Users size={50} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase italic">Néant Collaborateur</p></div>}
            </div>
          </div>
        </div>

        {/* COLONNE PROCESSUS & RESPONSABILITÉ (§4.4) */}
        <div className="lg:col-span-2 space-y-10 text-left">
          <div className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-3xl text-left">
            <ShieldCheck className="absolute -right-20 -bottom-20 text-white/5" size={300} />
            <div className="relative z-10 text-left">
              <h3 className="text-[11px] font-black uppercase mb-6 flex items-center gap-3 tracking-[0.4em] text-blue-400 italic text-left"><ShieldCheck size={20} /> Clause Responsabilité</h3>
              <p className="text-xl font-medium text-white/90 italic leading-relaxed text-left">Le segment <span className="text-blue-400 font-black uppercase">{unit.OU_Name}</span> garantit l&apos;application des procédures et la surveillance des indicateurs de performance rattachés à son périmètre.</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl text-left">
            <h3 className="text-sm font-black uppercase italic flex items-center gap-3 text-slate-900 tracking-tighter border-b pb-6 border-slate-50 text-left">
              <Briefcase size={24} className="text-blue-600" /> Maillage Processus
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
              {unit.OU_Processus?.length ? unit.OU_Processus.map((pr: any) => (
                <div key={pr.PR_Id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all group cursor-pointer text-left shadow-sm hover:shadow-lg">
                  <div className="flex justify-between items-start mb-6"><span className="text-[10px] font-black bg-blue-100 text-blue-700 px-4 py-2 rounded-xl italic shadow-inner">{pr.PR_Code}</span><ChevronRight size={22} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" /></div>
                  <h4 className="text-[15px] font-black uppercase italic text-slate-900 leading-tight group-hover:text-blue-700 transition-colors text-left">{pr.PR_Libelle}</h4>
                </div>
              )) : <div className="col-span-2 py-20 text-center opacity-30"><Briefcase size={50} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase italic">Néant Processus</p></div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/** 🧩 COMPOSANTS D'APPUI POUR LA FICHE DÉTAILLÉE */

function StatBadge({ icon: Icon, label, value, color }: any) {
  const colors: any = { 
    blue: 'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-500/10', 
    amber: 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-500/10', 
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-500/10' 
  };
  return (
    <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-4xl border border-slate-100 shadow-inner group hover:bg-white transition-all text-left">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${colors[color]}`}><Icon size={28} /></div>
      <div className="text-left"><p className="text-3xl font-black text-slate-900 italic leading-none mb-1 tracking-tighter">{value}</p><p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic leading-none">{label}</p></div>
    </div>
  );
}