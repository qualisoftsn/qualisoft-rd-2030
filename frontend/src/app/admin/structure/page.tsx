/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🏢 MODULE : GESTION DE STRUCTURE ORGANISATIONNELLE (elite-sde)
 * -------------------------------------------------------------------------
 * FIX : Dark Mode Matrix, Zéro Scroll, Responsive Modal.
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Plus, Layers, ShieldCheck, Search, X, Save, Lock
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function StructurePage() {
  const { tenantId, isAuthenticated } = useAuthStore() as any;
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
      toast.error("Erreur de synchronisation structure");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated, fetchData]);

  if (!isAuthenticated) return <div className="h-full flex items-center justify-center"><Lock className="text-red-500 animate-pulse" size={40} /></div>;

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
    <div className="h-full flex flex-col p-4 md:p-8 space-y-8 text-white font-sans italic selection:bg-blue-600/30">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6 shrink-0">
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white m-0">Architecture <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 text-xs m-0">
            <ShieldCheck size={14} className="text-blue-600" /> Noyau : <span className="font-black text-slate-300 uppercase">{tenantId}</span>
          </p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
          <button onClick={() => setActiveTab('SITES')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] transition-all cursor-pointer border-none ${activeTab === 'SITES' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-white'}`}>Sites</button>
          <button onClick={() => setActiveTab('UNITS')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] transition-all cursor-pointer border-none ${activeTab === 'UNITS' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-white'}`}>Unités</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* COLONNE PRINCIPALE (LISTING) */}
        <div className="flex-1 flex flex-col space-y-6 text-left min-w-0">
          <div className="flex flex-col sm:flex-row items-center bg-white/5 p-3 rounded-4xl shadow-sm gap-4 border border-white/5 shrink-0">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input placeholder="Filtrer la structure..." className="w-full pl-12 pr-4 py-4 bg-[#0B0F1A] rounded-2xl text-[10px] md:text-xs font-bold outline-none italic text-white placeholder:text-slate-600 transition-colors focus:border-blue-500 border border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowModal(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-white hover:text-blue-900 text-white px-6 md:px-8 py-4 rounded-2xl font-black uppercase text-[9px] md:text-[10px] flex justify-center items-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95 cursor-pointer border-none shrink-0">
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10 animate-in fade-in duration-500">
              {activeTab === 'SITES' ? 
                sites.filter(s => s.S_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(site => (
                  <div key={site.S_Id} className="bg-white/5 p-6 rounded-4xl border border-white/5 hover:border-blue-500/30 transition-all group">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><MapPin size={20} /></div>
                     <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-white m-0 truncate">{site.S_Name}</h3>
                     <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mt-1 italic tracking-widest truncate m-0">{site.S_Address || 'Dakar'}</p>
                  </div>
                )) : 
                units.filter(u => u.OU_Name.toLowerCase().includes(searchTerm.toLowerCase())).map(unit => (
                  <div key={unit.OU_Id} className="bg-white/5 p-6 rounded-4xl border border-white/5 hover:border-blue-500/30 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg italic border border-blue-500/20">{unit.OU_Type?.OUT_Label}</span>
                     </div>
                     <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-white m-0 truncate">{unit.OU_Name}</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase italic mt-1 truncate m-0">{unit.OU_Site?.S_Name}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* PANNEAU LATÉRAL (STATS) */}
        <div className="lg:w-80 xl:w-96 text-left shrink-0 pb-6 lg:pb-0">
          <div className="bg-blue-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
            <Layers className="absolute -right-10 -bottom-10 text-white/10 rotate-12 pointer-events-none" size={180} />
            <div className="relative z-10">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-blue-200 mb-2 italic m-0">Architecture Master</p>
              <h4 className="text-2xl md:text-3xl font-black italic uppercase leading-none mb-10 tracking-tighter m-0">Noyau SMI</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-end border-b border-white/20 pb-3">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase text-blue-100 italic">Sites actifs</span>
                    <span className="text-3xl md:text-4xl font-black italic leading-none">{sites.length}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/20 pb-3">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase text-blue-100 italic">Services / Depts</span>
                    <span className="text-3xl md:text-4xl font-black italic leading-none">{units.length}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-[3rem] w-full max-w-lg p-8 md:p-10 shadow-2xl text-left animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white m-0">Nouveau {activeTab === 'SITES' ? 'Site' : 'Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={24}/></button>
            </div>
            <form onSubmit={activeTab === 'SITES' ? handleSaveSite : handleSaveUnit} className="space-y-6">
              {activeTab === 'SITES' ? (
                <div className="space-y-4">
                  <input required className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl p-4 md:p-5 text-sm font-bold outline-none italic uppercase text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors" value={siteForm.S_Name} onChange={e => setSiteForm({...siteForm, S_Name: e.target.value})} placeholder="NOM DU SITE..." />
                  <input className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl p-4 md:p-5 text-sm font-bold outline-none italic uppercase text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors" value={siteForm.S_Address} onChange={e => setSiteForm({...siteForm, S_Address: e.target.value})} placeholder="ADRESSE / VILLE..." />
                </div>
              ) : (
                <div className="space-y-4">
                  <input required className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl p-4 md:p-5 text-sm font-bold outline-none italic uppercase text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors" value={unitForm.OU_Name} onChange={e => setUnitForm({...unitForm, OU_Name: e.target.value})} placeholder="NOM DE L'UNITÉ..." />
                  <select required className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-[10px] md:text-xs font-black uppercase italic outline-none text-white cursor-pointer focus:border-blue-500 transition-colors" value={unitForm.OU_SiteId} onChange={e => setUnitForm({...unitForm, OU_SiteId: e.target.value})}>
                    <option value="" className="text-slate-500">SÉLECTIONNER SITE</option>
                    {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                  </select>
                  <select required className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-[10px] md:text-xs font-black uppercase italic outline-none text-white cursor-pointer focus:border-blue-500 transition-colors" value={unitForm.OU_TypeId} onChange={e => setUnitForm({...unitForm, OU_TypeId: e.target.value})}>
                    <option value="" className="text-slate-500">NIVEAU HIÉRARCHIQUE</option>
                    {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-blue-900 text-white font-black uppercase py-5 md:py-6 rounded-2xl text-[10px] md:text-xs shadow-xl transition-all italic active:scale-95 border-none cursor-pointer flex justify-center items-center gap-2">
                <Save size={18} /> Valider Structure
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}