'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, ArrowLeft, ShieldCheck, Mail, 
  MapPin, ChevronRight, Activity, Target, AlertCircle,
  GitGraph, Calendar, Phone, FolderTree, ExternalLink,
  UserCircle, TrendingUp, Briefcase
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Types
interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_Email?: string;
  U_Phone?: string;
}

interface Site {
  S_Id: string;
  S_Name: string;
  S_Address?: string;
  S_City?: string;
  S_Country?: string;
}

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
}

interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Status?: string;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
  OU_UpdatedAt: string;
  OU_Type?: OrgUnitType;
  OU_Site?: Site;
  OU_Parent?: { OU_Id: string; OU_Name: string; } | null;
  OU_Children?: { OU_Id: string; OU_Name: string; OU_Type?: OrgUnitType; }[];
  OU_Users?: User[];
  OU_Processus?: Processus[];
}

export default function UnitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<OrgUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [sisterUnits, setSisterUnits] = useState<OrgUnit[]>([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/org-units/${id}`);
        setUnit(res.data);
        
        // Fetch sister units (same parent) for navigation
        if (res.data.OU_Parent?.OU_Id) {
          const siblingsRes = await apiClient.get(`/org-units?parentId=${res.data.OU_Parent.OU_Id}`);
          setSisterUnits(siblingsRes.data.filter((u: OrgUnit) => u.OU_Id !== id));
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          toast.error("Unité introuvable");
        } else {
          toast.error("Erreur de chargement");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchDetail();
  }, [id]);

  // Calcul stats
  const stats = useMemo(() => {
    if (!unit) return null;
    return {
      users: unit.OU_Users?.length || 0,
      processes: unit.OU_Processus?.length || 0,
      children: unit.OU_Children?.length || 0,
      age: Math.floor((new Date().getTime() - new Date(unit.OU_CreatedAt).getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [unit]);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
        <Activity className="animate-spin text-blue-600" size={48} />
        <div className="space-y-2 text-center">
          <p className="font-black uppercase italic text-[10px] tracking-[0.4em] text-slate-400">Analyse de la structure...</p>
          <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-[50px] p-16 text-center border border-slate-100 shadow-xl max-w-md">
          <AlertCircle size={64} className="mx-auto mb-6 text-red-500" />
          <h1 className="text-2xl font-black uppercase italic text-slate-900 mb-3">Unité introuvable</h1>
          <p className="text-slate-500 mb-8">Cette unité organisationnelle n'existe pas ou a été archivée.</p>
          <Link 
            href="/dashboard/organization/chart"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all"
          >
            <ArrowLeft size={16} /> Retour organisme
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen italic font-sans text-left">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-wrap">
        <Link href="/dashboard/organization/chart" className="hover:text-blue-600 transition-colors">
          Organigramme
        </Link>
        <ChevronRight size={14} />
        {unit.OU_Parent && (
          <>
            <button 
              onClick={() => router.push(`/dashboard/organization/units/${unit.OU_Parent!.OU_Id}`)}
              className="hover:text-blue-600 transition-colors truncate max-w-[150px]"
            >
              {unit.OU_Parent.OU_Name}
            </button>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-slate-900 truncate max-w-[200px]">{unit.OU_Name}</span>
      </div>

      {/* HEADER : IDENTITÉ */}
      <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
            <Building2 size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic shadow-lg">
                  {unit.OU_Type?.OUT_Label || 'Unité Standard'}
                </span>
                {unit.OU_IsActive ? (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
                    Active
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-red-200">
                    Archivée
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                  {unit.OU_Name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-[10px] uppercase">
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <MapPin size={14} className="text-blue-500" /> 
                  {unit.OU_Site?.S_Name}
                  {unit.OU_Site?.S_City && `, ${unit.OU_Site.S_City}`}
                </span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <Calendar size={14} className="text-slate-400" /> 
                  Créée il y a {stats?.age} jours
                </span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-3">
              <button 
                onClick={() => router.push(`/dashboard/organization/units/${id}/edit`)}
                className="px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
              >
                Modifier <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100">
            <StatBadge 
              icon={Users} 
              label="Collaborateurs" 
              value={stats?.users || 0} 
              color="blue"
            />
            <StatBadge 
              icon={Briefcase} 
              label="Processus" 
              value={stats?.processes || 0} 
              color="amber"
            />
            <StatBadge 
              icon={FolderTree} 
              label="Sous-unités" 
              value={stats?.children || 0} 
              color="emerald"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE 1 : COLLABORATEURS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-50">
              <h3 className="text-[11px] font-black uppercase flex items-center gap-2 text-slate-900 tracking-tighter">
                <Users size={20} className="text-blue-600" /> 
                Équipe ({unit.OU_Users?.length || 0})
              </h3>
            </div>
            
            <div className="space-y-3">
              {unit.OU_Users && unit.OU_Users.length > 0 ? (
                unit.OU_Users.map((user) => (
                  <div 
                    key={user.U_Id} 
                    onClick={() => router.push(`/dashboard/users/${user.U_Id}`)}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-sm font-black group-hover:bg-blue-600 transition-colors shadow-md">
                      {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase text-slate-900 leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {user.U_FirstName} {user.U_LastName}
                      </p>
                      <p className="text-[9px] font-black text-blue-500 uppercase italic truncate">
                        {user.U_Role}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400" />
                  </div>
                ))
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center">
                   <Users size={40} className="text-slate-200 mb-3" />
                   <p className="text-[10px] font-black text-slate-400 uppercase italic">Aucun membre assigné</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation latérale : Unités sœurs */}
          {sisterUnits.length > 0 && (
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase mb-6 flex items-center gap-2 text-slate-900 tracking-tighter">
                <FolderTree size={18} className="text-slate-400" /> 
                Même niveau hiérarchique
              </h3>
              <div className="space-y-2">
                {sisterUnits.map((sister) => (
                  <button
                    key={sister.OU_Id}
                    onClick={() => router.push(`/dashboard/organization/units/${sister.OU_Id}`)}
                    className="w-full text-left p-4 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-3 group border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all text-[10px] font-black">
                      {sister.OU_Name[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-700 uppercase truncate group-hover:text-blue-600 transition-colors">
                      {sister.OU_Name}
                    </span>
                    <ChevronRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNES 2-3 : PROCESSUS & INFO */}
        <div className="lg:col-span-2 space-y-8">
            
          {/* CARTE MISSIONS */}
          <div className="bg-slate-900 p-8 lg:p-10 rounded-[35px] text-white relative overflow-hidden shadow-2xl">
              <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={250} />
              <div className="relative z-10">
                <h3 className="text-[11px] font-black uppercase mb-6 flex items-center gap-2 tracking-[0.3em] text-slate-300">
                    <ShieldCheck size={18} className="text-blue-400" /> 
                    Responsabilités SMI
                </h3>
                <div className="space-y-4 max-w-3xl">
                  <p className="text-lg font-medium text-white/90 italic leading-relaxed">
                    Cette unité assure le pilotage et la maîtrise des processus qui lui sont rattachés dans le système de management intégré.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/10">
                      <span className="text-blue-300 block text-[8px] mb-1">Champ d'action</span>
                      Opérationnel
                    </div>
                    <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/10">
                      <span className="text-blue-300 block text-[8px] mb-1">Pilotage</span>
                      {unit.OU_Users?.find(u => u.U_Role === 'PILOTE') ? 'Délégué' : 'Direct'}
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* PROCESSUS */}
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-50">
                <h3 className="text-[11px] font-black uppercase flex items-center gap-2 text-slate-900 tracking-tighter">
                    <Briefcase size={20} className="text-blue-600" /> 
                    Processus pilotés ({unit.OU_Processus?.length || 0})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unit.OU_Processus && unit.OU_Processus.length > 0 ? (
                      unit.OU_Processus.map((pr) => (
                          <div 
                            key={pr.PR_Id} 
                            onClick={() => router.push(`/dashboard/processes/${pr.PR_Id}`)}
                            className="p-6 bg-slate-50 border border-slate-100 rounded-[30px] hover:border-blue-500 hover:bg-blue-50/30 transition-all group cursor-pointer"
                          >
                              <div className="flex justify-between items-start mb-4">
                                  <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg italic shadow-sm">
                                    {pr.PR_Code}
                                  </span>
                                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                              </div>
                              <h4 className="text-sm font-black uppercase italic text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                                {pr.PR_Libelle}
                              </h4>
                              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60">
                                  <div className="flex items-center gap-1.5">
                                    <Target size={12} className="text-emerald-500" />
                                    <span className="text-[9px] font-bold text-slate-600 uppercase">Objectif QSE</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                  <span className="text-[9px] font-black text-emerald-600">Actif</span>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center bg-slate-50/50">
                          <Briefcase size={40} className="text-slate-200 mb-3" />
                          <p className="text-[10px] font-black text-slate-400 uppercase italic">Aucun processus rattaché</p>
                      </div>
                  )}
              </div>
          </div>

          {/* SOUS-UNITÉS (Enfants directs) */}
          {unit.OU_Children && unit.OU_Children.length > 0 && (
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase mb-6 flex items-center gap-2 text-slate-900 tracking-tighter border-b pb-4 border-slate-50">
                <FolderTree size={20} className="text-emerald-600" /> 
                Sous-unités directes ({unit.OU_Children.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unit.OU_Children.map((child) => (
                  <button
                    key={child.OU_Id}
                    onClick={() => router.push(`/dashboard/organization/units/${child.OU_Id}`)}
                    className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 hover:border-emerald-200 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center text-[10px] font-black">
                        {child.OU_Name[0]}
                      </span>
                      <ChevronRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-800 leading-tight line-clamp-2">
                      {child.OU_Name}
                    </p>
                    {child.OU_Type?.OUT_Label && (
                      <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">
                        {child.OU_Type.OUT_Label}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component pour les statistiques
function StatBadge({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: number; 
  color: 'blue' | 'amber' | 'emerald'; 
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 italic">{value}</p>
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
      </div>
    </div>
  );
}