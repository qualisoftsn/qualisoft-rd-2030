/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, Users, ArrowLeft, ShieldCheck, Mail, 
  BadgeCheck, LayoutPanelLeft, ChevronRight, Activity,
  Target, AlertCircle
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';

export default function UnitDetailPage() {
  const { id } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/org-units/${id}`);
        setUnit(res.data);
      } catch (err) {
        console.error("Erreur de chargement des détails de l'unité");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
      <Activity className="animate-spin text-blue-600" size={40} />
      <p className="font-black uppercase italic text-[10px] tracking-widest text-slate-400">Analyse de la structure...</p>
    </div>
  );

  if (!unit) return <div className="p-10 text-red-500 font-black italic">UNITÉ INTROUVABLE</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans text-left">
      {/* NAVIGATION RETOUR */}
      <Link href="/dashboard/organization/chart" className="text-blue-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter hover:gap-3 transition-all w-fit">
        <ArrowLeft size={16} /> Retour à l&apos;organigramme
      </Link>

      {/* HEADER : IDENTITÉ DE L'UNITÉ */}
      <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
            <Building2 size={120} />
        </div>
        
        <div className="relative z-10">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1 rounded-full italic shadow-lg shadow-blue-200">
              {unit.OU_Type?.OUT_Label || 'Unité Standard'}
            </span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mt-4 text-slate-900 leading-none">
                {unit.OU_Name}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-bold mt-3 uppercase text-[10px]">
                <Building2 size={14} className="text-blue-500" /> 
                {unit.OU_Site?.S_Name} — {unit.OU_Site?.S_Address || 'Sénégal'}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE 1 : COLLABORATEURS */}
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-black uppercase mb-8 flex items-center gap-2 text-slate-900 border-b pb-4 tracking-tighter">
            <Users size={20} className="text-blue-600" /> 
            Équipe Rattachée ({unit.OU_Users?.length || 0})
          </h3>
          
          <div className="space-y-3">
            {unit.OU_Users && unit.OU_Users.length > 0 ? (
              unit.OU_Users.map((user: any) => (
                <div key={user.U_Id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group cursor-default">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black group-hover:bg-blue-600 transition-colors shadow-md">
                    {user.U_FirstName[0]}{user.U_LastName[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-black uppercase text-slate-900 leading-none mb-1 truncate">
                      {user.U_FirstName} {user.U_LastName}
                    </p>
                    <p className="text-[8px] font-black text-blue-500 uppercase italic truncate">
                        {user.U_Role}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center">
                 <Users size={32} className="text-slate-200 mb-2" />
                 <p className="text-[9px] font-black text-slate-300 uppercase italic">Aucun membre assigné</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 2 & 3 : PROCESSUS ET MISSIONS */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* CARTE DES MISSIONS */}
            <div className="bg-slate-900 p-8 rounded-[35px] text-white relative overflow-hidden shadow-2xl">
                <ShieldCheck className="absolute -right-5 -bottom-5 text-white/5" size={150} />
                <h3 className="text-[10px] font-black uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                    <BadgeCheck size={18} className="text-blue-500" /> Missions SMQ
                </h3>
                <p className="text-sm font-medium text-slate-400 italic leading-relaxed max-w-xl">
                    Cette unité assure le pilotage opérationnel des activités qualité. Elle est garante de la maîtrise des processus 
                    qui lui sont rattachés et de l&apos;atteinte des objectifs de performance fixés par la Direction.
                </p>
            </div>

            {/* LISTE DES PROCESSUS RATTACHÉS */}
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black uppercase mb-8 flex items-center gap-2 text-slate-900 border-b pb-4 tracking-tighter">
                    <LayoutPanelLeft size={20} className="text-blue-600" /> 
                    Processus sous responsabilité ({unit.OU_Processus?.length || 0})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unit.OU_Processus && unit.OU_Processus.length > 0 ? (
                        unit.OU_Processus.map((pr: any) => (
                            <div key={pr.PR_Id} className="p-6 bg-slate-50 border border-slate-100 rounded-4xl hover:border-blue-500 hover:bg-white transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full italic">{pr.PR_Code}</span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                                </div>
                                <h4 className="text-sm font-black uppercase italic text-slate-900 mb-2 truncate">{pr.PR_Libelle}</h4>
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-400 uppercase">Risques</span>
                                        <span className="text-[10px] font-black text-slate-900 italic">Sous Contrôle</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-400 uppercase">Performance</span>
                                        <span className="text-[10px] font-black text-green-600 italic">92%</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center">
                            <LayoutPanelLeft size={32} className="text-slate-200 mb-2" />
                            <p className="text-[9px] font-black text-slate-300 uppercase italic">Aucun processus rattaché à cette unité</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}