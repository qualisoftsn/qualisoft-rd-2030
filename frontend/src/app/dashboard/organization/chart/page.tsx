'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, MapPin, Loader2, GitGraph, 
  ChevronRight, ArrowUpRight, Search, LayoutGrid 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';

export default function InteractiveOrgChart() {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/org-units');
      setUnits(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'organigramme");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnits(); }, []);

  // Filtrage pour la recherche
  const filteredUnits = units.filter(u => 
    u.OU_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.OU_Type?.OUT_Label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest">
          Synchronisation de la structure...
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
            <GitGraph className="text-blue-600" size={32} /> Organigramme SMI
          </h1>
          <p className="text-slate-500 font-medium text-sm">Architecture fonctionnelle et opérationnelle de l&apos;organisation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Rechercher une unité..."
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUnits.map((unit) => (
          <div 
            key={unit.OU_Id} 
            className="bg-white rounded-[35px] p-6 shadow-xl border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Building2 size={80} />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors duration-500">
                <Building2 size={28} />
              </div>
              <div className="flex flex-col items-end">
                {/* ✅ CORRECTION ICI : OUT_Label */}
                <span className="bg-blue-50 text-blue-700 text-[8px] font-black uppercase px-3 py-1 rounded-lg border border-blue-100 italic tracking-tighter">
                  {unit.OU_Type?.OUT_Label || 'Standard'}
                </span>
                <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest">
                  ID: {unit.OU_Id.substring(0, 8)}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
              {unit.OU_Name}
            </h3>

            <div className="space-y-3 py-4 border-y border-slate-50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase italic">
                <MapPin size={14} className="text-blue-600" />
                {unit.OU_Site?.S_Name || 'Site non défini'}
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <Users size={14} />
                Effectif : <span className="text-slate-900 ml-1">---</span>
              </div>
            </div>

            {/* ✅ BOUTON ACTION ACTIVÉ */}
            <button 
              onClick={() => router.push(`/dashboard/organization/units/${unit.OU_Id}`)}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
            >
              Voir la fiche détaillée <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredUnits.length === 0 && (
        <div className="bg-white rounded-[50px] p-20 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
             <GitGraph size={40} />
          </div>
          <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">
            Aucun maillon de la structure n&apos;est visible ici.
          </p>
        </div>
      )}
    </div>
  );
}