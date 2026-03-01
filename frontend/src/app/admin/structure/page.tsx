/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🏢 MODULE : GESTION DE STRUCTURE ORGANISATIONNELLE
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:35 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Building, Plus, Trash2, ChevronRight, Layers, 
  ShieldCheck, Search, X, Save, Loader2, Lock
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function StructurePage() {
  const { tenantId, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [sites, setSites] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'SITES' | 'UNITS'>('SITES');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [siteForm, setSiteForm] = useState({ S_Name: '', S_Address: '' });
  const [unitForm, setUnitForm] = useState({ OU_Name: '', OU_SiteId: '', OU_TypeId: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, uRes, tRes] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units'),
        apiClient.get('/org-unit-types')
      ]);
      setSites(sRes.data);
      setUnits(uRes.data);
      setUnitTypes(tRes.data);
    } catch (error) {
      console.error("Erreur de synchronisation structure");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated, fetchData]);

  if (!isAuthenticated) return <div className="h-screen flex items-center justify-center bg-slate-50"><Lock className="text-red-500 animate-pulse" size={40} /></div>;

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/sites', siteForm);
      setShowModal(false);
      setSiteForm({ S_Name: '', S_Address: '' });
      fetchData();
      toast.success("Site ajouté");
    } catch (error) { toast.error("Erreur d'ajout"); }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/org-units', unitForm);
      setShowModal(false);
      setUnitForm({ OU_Name: '', OU_SiteId: '', OU_TypeId: '' });
      fetchData();
      toast.success("Unité ajoutée");
    } catch (error) { toast.error("Erreur d'ajout"); }
  };

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans italic selection:bg-blue-100">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Architecture <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" /> Noyau : <span className="font-black text-slate-900 uppercase">{tenantId}</span>
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('SITES')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'SITES' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>Sites</button>
          <button onClick={() => setActiveTab('UNITS')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'UNITS' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>Unités</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-8 text-left">
          <div className="flex items-center bg-white p-4 rounded-3xl shadow-sm gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input placeholder="Filtrer la structure..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none italic" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'SITES' ? 
              sites.filter(s => s.S_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(site => (
                <div key={site.S_Id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><MapPin size={24} /></div>
                   <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-800">{site.S_Name}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 italic tracking-widest">{site.S_Address || 'Dakar'}</p>
                </div>
              )) : 
              units.filter(u => u.OU_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(unit => (
                <div key={unit.OU_Id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg italic">{unit.OU_Type?.OUT_Label}</span>
                   </div>
                   <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-800">{unit.OU_Name}</h3>
                   <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-2">{unit.OU_Site?.S_Name}</p>
                </div>
              ))
            }
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 text-left">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <Layers className="absolute -right-6 -bottom-6 text-white/5 rotate-12" size={150} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2 italic">Architecture Master</p>
            <h4 className="text-3xl font-black italic uppercase leading-none mb-10 tracking-tighter">Noyau SMI</h4>
            <div className="space-y-6">
               <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 italic">Sites actifs</span>
                  <span className="text-3xl font-black italic">{sites.length}</span>
               </div>
               <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 italic">Services</span>
                  <span className="text-3xl font-black italic">{units.length}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl text-left">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nouveau {activeTab === 'SITES' ? 'Site' : 'Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-transparent border-none cursor-pointer"><X size={24}/></button>
            </div>
            <form onSubmit={activeTab === 'SITES' ? handleSaveSite : handleSaveUnit} className="space-y-6">
              {activeTab === 'SITES' ? (
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none italic uppercase" value={siteForm.S_Name} onChange={e => setSiteForm({...siteForm, S_Name: e.target.value})} placeholder="NOM DU SITE..." />
              ) : (
                <div className="space-y-4">
                  <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none italic uppercase" value={unitForm.OU_Name} onChange={e => setUnitForm({...unitForm, OU_Name: e.target.value})} placeholder="NOM DE L'UNITÉ..." />
                  <select required className="w-full bg-slate-50 border p-5 rounded-2xl text-[10px] font-black uppercase italic outline-none" value={unitForm.OU_SiteId} onChange={e => setUnitForm({...unitForm, OU_SiteId: e.target.value})}>
                    <option value="">SÉLECTIONNER SITE</option>
                    {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                  </select>
                  <select required className="w-full bg-slate-50 border p-5 rounded-2xl text-[10px] font-black uppercase italic outline-none" value={unitForm.OU_TypeId} onChange={e => setUnitForm({...unitForm, OU_TypeId: e.target.value})}>
                    <option value="">NIVEAU HIÉRARCHIQUE</option>
                    {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black uppercase py-6 rounded-2xl text-[12px] shadow-2xl transition-all italic active:scale-95"><Save size={18} className="inline mr-2" /> Valider Structure</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}