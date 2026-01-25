/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Building, Plus, Trash2, Edit3, 
  ChevronRight, Layers, ShieldCheck, Search, X, Save,
  AlertCircle, Loader2, Lock
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Site {
  S_Id: string;
  S_Name: string;
  S_Address?: string;
  S_IsActive: boolean;
  _count?: { S_OrgUnits: number };
}

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_IsActive: boolean;
  OU_SiteId: string;
  OU_Type: OrgUnitType;
  OU_Site?: Site;
}

export default function StructurePage() {
  const { tenantId, token } = useAuthStore();
  const router = useRouter();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [unitTypes, setUnitTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<'SITES' | 'UNITS'>('SITES');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [siteForm, setSiteForm] = useState({ S_Name: '', S_Address: '' });
  const [unitForm, setUnitForm] = useState({ OU_Name: '', OU_SiteId: '', OU_TypeId: '' });

  const fetchData = useCallback(async () => {
    // 🛡️ Barrière de sécurité : On ne tente rien sans Token ou Tenant
    if (!token || !tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sRes, uRes, tRes] = await Promise.allSettled([
        apiClient.get<Site[]>('/sites'),
        apiClient.get<OrgUnit[]>('/org-units'),
        apiClient.get<OrgUnitType[]>('/org-unit-types')
      ]);

      if (sRes.status === 'fulfilled') setSites(sRes.value.data || []);
      if (uRes.status === 'fulfilled') setUnits(uRes.value.data || []);
      if (tRes.status === 'fulfilled') setUnitTypes(tRes.value.data || []);

    } catch (error: any) {
      console.error("🚨 [STRUCTURE_SYNC_ERROR]:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Redirection si tentative d'accès sans session
  if (!loading && (!token || !tenantId)) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Accès Restreint</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-xs font-medium italic">Une authentification est requise pour accéder au noyau organisationnel.</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-[#2563eb] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-slate-900 transition-all"
        >
          Se connecter à l&apos;instance
        </button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-[#2563eb] mx-auto" size={50} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">
          Alignement des structures Qualisoft...
        </p>
      </div>
    </div>
  );

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/sites', siteForm);
      setShowModal(false);
      setSiteForm({ S_Name: '', S_Address: '' });
      fetchData();
    } catch (error: any) {
      alert(`Erreur: ${error.response?.data?.message || 'Action impossible'}`);
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/org-units', unitForm);
      setShowModal(false);
      setUnitForm({ OU_Name: '', OU_SiteId: '', OU_TypeId: '' });
      fetchData();
    } catch (error: any) {
      alert("Erreur lors de l'enregistrement de l'unité.");
    }
  };

  const archiveSite = async (id: string) => {
    if (!confirm("Archiver ce site ?")) return;
    try {
      await apiClient.delete(`/sites/${id}`);
      fetchData();
    } catch (error: any) {
      alert("Impossible d'archiver : dépendances actives détectées.");
    }
  };

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans italic selection:bg-blue-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            Architecture <span className="text-[#2563eb]">Organisationnelle</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#2563eb]" />
            Tenant Actif : <span className="font-black text-slate-900">{tenantId}</span>
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('SITES')}
            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] transition-all duration-300 ${activeTab === 'SITES' ? 'bg-white text-[#2563eb] shadow-md scale-105 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Implantations (Sites)
          </button>
          <button 
            onClick={() => setActiveTab('UNITS')}
            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] transition-all duration-300 ${activeTab === 'UNITS' ? 'bg-white text-[#2563eb] shadow-md scale-105 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Services (Unités)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* LISTING */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-4xl shadow-sm border border-slate-100 gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Rechercher..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-xs outline-none border-none font-bold focus:ring-2 focus:ring-[#2563eb]/10 transition-all" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="w-full md:w-auto bg-[#2563eb] hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                <Plus size={18} /> Ajouter {activeTab === 'SITES' ? 'Site' : 'Unité'}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeTab === 'SITES' ? (
              sites.filter(s => s.S_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(site => (
                <div key={site.S_Id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-[#2563eb]/10 transition-colors" />
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-14 h-14 bg-blue-50 text-[#2563eb] rounded-2xl flex items-center justify-center shadow-inner">
                        <MapPin size={28} />
                      </div>
                      <button onClick={() => archiveSite(site.S_Id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                   </div>
                   <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 mb-2">{site.S_Name}</h3>
                   <p className="text-[11px] text-slate-400 font-bold uppercase mb-8 flex items-center gap-2">
                     <Building size={14} className="text-slate-300" /> {site.S_Address || 'Dakar, Sénégal'}
                   </p>
                   <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[10px] font-black text-[#2563eb] bg-blue-50 px-4 py-2 rounded-xl uppercase tracking-tighter">
                        <Layers size={12} /> {site._count?.S_OrgUnits || 0} Unités
                      </div>
                      <ChevronRight size={20} className="text-slate-200 group-hover:translate-x-2 group-hover:text-[#2563eb] transition-all" />
                   </div>
                </div>
              ))
            ) : (
              units.filter(u => u.OU_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(unit => (
                <div key={unit.OU_Id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#2563eb]/30 transition-all group min-h-50">
                   <div>
                     <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563eb] py-2 px-4 bg-blue-50 rounded-xl border border-blue-100">
                          {unit.OU_Type?.OUT_Label || 'SERVICE'}
                        </span>
                        <button className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                     </div>
                     <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-800 mb-2">{unit.OU_Name}</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase italic flex items-center gap-2 group-hover:text-[#2563eb] transition-colors">
                        <MapPin size={12} /> {unit.OU_Site?.S_Name || 'Siège'}
                     </p>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR RÉSUMÉ */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb]/10 blur-[80px] rounded-full" />
              <Layers className="absolute -right-6 -bottom-6 text-white/5 rotate-12" size={180} />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2563eb] mb-4">Système Multi-Tenant</p>
                <h4 className="text-4xl font-black italic uppercase leading-none mb-12 tracking-tighter">Noyau <br/> Organisationnel</h4>
                <div className="space-y-8">
                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Implantations</span>
                      <span className="text-4xl font-black italic text-white leading-none">{sites.length}</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Unités SMI</span>
                      <span className="text-4xl font-black italic text-white leading-none">{units.length}</span>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODALE CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-3xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                  {activeTab === 'SITES' ? 'Nouveau Site' : 'Nouveau Service'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white text-slate-400 hover:text-slate-900 shadow-sm transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={activeTab === 'SITES' ? handleSaveSite : handleSaveUnit} className="p-12 space-y-8">
              {activeTab === 'SITES' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Nom du Site</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-[#2563eb] italic" 
                      value={siteForm.S_Name} onChange={e => setSiteForm({...siteForm, S_Name: e.target.value})} placeholder="Ex: SIEGE DAKAR" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Nom de l&apos;unité</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-[#2563eb] italic" 
                      value={unitForm.OU_Name} onChange={e => setUnitForm({...unitForm, OU_Name: e.target.value})} placeholder="DIRECTION..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <select required className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-[11px] font-black uppercase italic"
                      value={unitForm.OU_SiteId} onChange={e => setUnitForm({...unitForm, OU_SiteId: e.target.value})}>
                      <option value="">-- SITE --</option>
                      {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                    </select>
                    <select required className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-[11px] font-black uppercase italic"
                      value={unitForm.OU_TypeId} onChange={e => setUnitForm({...unitForm, OU_TypeId: e.target.value})}>
                      <option value="">-- NIVEAU --</option>
                      {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                    </select>
                  </div>
                </>
              )}
              <button type="submit" className="w-full bg-[#2563eb] hover:bg-slate-900 text-white font-black uppercase py-6 rounded-3xl text-[12px] shadow-2xl transition-all active:scale-95 italic">
                <Save size={20} /> Valider la Structure
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}