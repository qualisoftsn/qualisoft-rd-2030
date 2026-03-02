/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚨 MODULE : INCIDENTS SSE (§8.2 ISO 14001)
 * Fix : Restauration du calcul CNQ et de la mise en forme haute densité.
 * Focus : Conservation intégrale des métadonnées et du défilement sécurisé.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:22 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  AlertTriangle, Plus, Search, MapPin, Trash2, 
  RefreshCcw, ChevronRight, ShieldCheck, 
  DollarSign, Activity, Microscope, Flame, X, Save, Calendar, User, Building2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function EnvironmentIncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [iRes, sRes, uRes] = await Promise.all([
        apiClient.get('/sse-events'), 
        apiClient.get('/sites'),
        apiClient.get('/users')
      ]);
      setIncidents(iRes.data?.data || iRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setUsers(uRes.data?.data || uRes.data || []);
    } catch (e) {
      toast.error("RUPTURE DE SYNCHRONISATION REGISTRE SSE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.SSE_AvecArret).length;
    const totalDays = incidents.reduce((acc, i) => acc + (Number(i.SSE_NbJoursArret) || 0), 0);
    const cnq = totalDays * 85000; 
    return { total, critical, cnq: cnq.toLocaleString(), severity: total > 0 ? Math.round((critical / total) * 100) : 0 };
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter(i => 
      (i.SSE_Description?.toLowerCase().includes(search.toLowerCase()) || i.SSE_Lieu?.toLowerCase().includes(search.toLowerCase())) &&
      (selectedSite === 'ALL' || i.SSE_SiteId === selectedSite)
    );
  }, [incidents, search, selectedSite]);

  const handleDelete = async (id: string) => {
    if (!confirm('SCELLAGE : CONFIRMER LA SUPPRESSION DÉFINITIVE DU REGISTRE ?')) return;
    try {
      await apiClient.delete(`/sse-events/${id}`);
      toast.success('INCIDENT CLASSÉ');
      fetchData();
    } catch { toast.error('ERREUR DE SUPPRESSION'); }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 italic font-black">
      <RefreshCcw className="animate-spin text-red-600" size={40} />
      <span className="text-red-600 uppercase text-[10px] tracking-[0.5em] animate-pulse">Syncing SSE Registry...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 mb-6 shrink-0 mt-12 lg:mt-0 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] m-0 leading-none">ISO 14001:2015 §8.2 • Crisis Matrix</p>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0 leading-none">Registre <span className="text-red-600">Incidents</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"><RefreshCcw size={18}/></button>
          <button onClick={() => { setEditingIncident(null); setIsFormOpen(true); }} className="bg-red-600 hover:bg-white hover:text-red-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic shadow-lg">
            <Plus size={16} strokeWidth={3} /> Déclarer Écart
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 shrink-0">
        <KPICard label="Incidents Totaux" value={stats.total} icon={<Activity size={16}/>} color="text-red-500" />
        <KPICard label="Taux de Gravité" value={`${stats.severity}%`} icon={<Flame size={16}/>} color="text-amber-500" />
        <KPICard label="Estimation CNQ" value={`${stats.cnq} XOF`} icon={<DollarSign size={16}/>} color="text-emerald-500" />
        <KPICard label="SMI Status" value="VIGILANCE" icon={<ShieldCheck size={16}/>} color="text-blue-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="RECHERCHER DANS LE REGISTRE SDE..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic" />
        </div>
        <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-6 py-3 text-[9px] font-black uppercase italic outline-none text-white cursor-pointer appearance-none">
          <option value="ALL">TOUS LES SITES</option>
          {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
        </select>
      </div>

      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <table className="w-full text-left min-w-225">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10 font-black uppercase italic text-[8px] text-slate-500">
              <tr>
                <th className="px-6 py-4">Méta-Données</th>
                <th className="px-6 py-4">Typologie & Sévérité</th>
                <th className="px-6 py-4">Exposé des Faits</th>
                <th className="px-6 py-4 text-right">Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center opacity-10 font-black uppercase text-xl italic tracking-widest">Registre Vierge</td></tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.SSE_Id} className="group hover:bg-red-600/5 transition-all">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic leading-none mb-2">{new Date(i.SSE_DateEvent).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2 text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">
                          <MapPin size={10} className="text-red-600" /> {i.SSE_Lieu}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase italic border", 
                          i.SSE_AvecArret ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>
                          {i.SSE_Type?.replace(/_/g, ' ')}
                        </span>
                        {i.SSE_AvecArret && <span className="text-[8px] font-black text-amber-500 uppercase italic animate-pulse">⚠️ ARRÊT : {i.SSE_NbJoursArret}J</span>}
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-md">
                      <p className="text-[10px] text-slate-300 italic leading-relaxed line-clamp-2 uppercase font-medium m-0 tracking-wide">
                        {i.SSE_Description}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingIncident(i); setIsFormOpen(true); }} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-amber-500 border-none cursor-pointer"><Microscope size={14}/></button>
                        <button onClick={() => handleDelete(i.SSE_Id)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 border-none cursor-pointer"><Trash2 size={14}/></button>
                        <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white border-none cursor-pointer"><ChevronRight size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isFormOpen && (
        <SSEFormOverlay sites={sites} users={users} data={editingIncident} onClose={() => setIsFormOpen(false)} onSuccess={() => { fetchData(); setIsFormOpen(false); }} />
      )}

      <footer className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <AlertTriangle size={24} className="text-red-600" />
          <div className="text-left leading-none">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 mb-1 leading-none">SSE Sovereign Hub</p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none">Matrice de Prévention • ISO 14001 Integration</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>
      </footer>
    </div>
  );
}

// --- SHARED FORM LOGIC ---

function SSEFormOverlay({ sites, users, data, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    SSE_DateEvent: data?.SSE_DateEvent ? new Date(data.SSE_DateEvent).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    SSE_Lieu: data?.SSE_Lieu || "",
    SSE_Type: data?.SSE_Type || "INCIDENT",
    SSE_Description: data?.SSE_Description || "",
    SSE_AvecArret: data?.SSE_AvecArret || false,
    SSE_NbJoursArret: data?.SSE_NbJoursArret || 0,
    SSE_SiteId: data?.SSE_SiteId || "",
    SSE_ReporterId: data?.SSE_ReporterId || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage de l'incident...");
    try {
      if (data?.SSE_Id) await apiClient.patch(`/sse-events/${data.SSE_Id}`, form);
      else await apiClient.post('/sse-events', form);
      toast.success("REGISTRE SSE MIS À JOUR", { id: tid });
      onSuccess();
    } catch { toast.error("ERREUR DE SCELLAGE", { id: tid }); }
  };

  return (
    <div className="fixed inset-0 z-600 flex items-center justify-center p-6 italic font-black uppercase">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#151A2D] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 lg:p-12 shadow-4xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95">
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
           <h3 className="text-2xl font-black uppercase tracking-tighter m-0 italic flex items-center gap-4">
             <div className="p-3 bg-red-600/10 rounded-xl"><Plus size={20} className="text-red-600"/></div>
             DÉCLARATION <span className="text-red-600">SSE</span>
           </h3>
           <X size={24} className="cursor-pointer text-slate-500 hover:text-white" onClick={onClose} />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={10}/> DATE ÉVÉNEMENT *</label>
              <input type="date" required value={form.SSE_DateEvent} onChange={e => setForm({...form, SSE_DateEvent: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 italic" />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2"><MapPin size={10}/> LIEU PRÉCIS *</label>
              <input required value={form.SSE_Lieu} onChange={e => setForm({...form, SSE_Lieu: e.target.value.toUpperCase()})} placeholder="EX: ZONE STOCKAGE" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 italic uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Activity size={10}/> TYPOLOGIE ISO</label>
              <select value={form.SSE_Type} onChange={e => setForm({...form, SSE_Type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 italic cursor-pointer">
                <option value="INCIDENT">INCIDENT ENV</option>
                <option value="ACCIDENT_SANS_ARRET">ACCIDENT (SANS ARRET)</option>
                <option value="ACCIDENT_AVEC_ARRET">ACCIDENT (AVEC ARRET)</option>
                <option value="PRESQUE_ACCIDENT">PRESQUE ACCIDENT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Building2 size={10}/> SITE D&apos;ATTACHE (§4.4) *</label>
              <select required value={form.SSE_SiteId} onChange={e => setForm({...form, SSE_SiteId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 italic cursor-pointer">
                <option value="">CHOISIR SITE...</option>
                {sites.map((s:any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2"><User size={10}/> AGENT DÉCLARANT (§7.2) *</label>
            <select required value={form.SSE_ReporterId} onChange={e => setForm({...form, SSE_ReporterId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 italic cursor-pointer">
              <option value="">SÉLECTIONNER COLLABORATEUR...</option>
              {users.map((u:any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
            </select>
          </div>

          <div className="p-5 bg-red-600/10 border border-red-600/20 rounded-4xl flex flex-col sm:flex-row items-center gap-6">
             <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.SSE_AvecArret} onChange={e => setForm({...form, SSE_AvecArret: e.target.checked})} className="w-6 h-6 cursor-pointer accent-red-600" />
                <label className="text-[10px] font-black text-red-500 uppercase italic m-0">INCAPACITÉ / ARRÊT ?</label>
             </div>
             {form.SSE_AvecArret && (
               <div className="flex items-center gap-3">
                 <label className="text-[9px] font-black text-slate-500 uppercase italic m-0">NB JOURS :</label>
                 <input type="number" value={form.SSE_NbJoursArret} onChange={e => setForm({...form, SSE_NbJoursArret: parseInt(e.target.value) || 0})} className="w-24 bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] font-black text-white outline-none" />
               </div>
             )}
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 italic leading-none flex items-center gap-2">RÉCIT ANALYTIQUE DES FAITS (§10.2)</label>
            <textarea required value={form.SSE_Description} onChange={e => setForm({...form, SSE_Description: e.target.value})} rows={4} className="w-full bg-white/5 border border-white/10 rounded-4xl p-6 text-[11px] font-black text-slate-300 outline-none focus:border-red-600 italic resize-none uppercase" placeholder="DÉCRIRE LES ÉCARTS ET ÉVIDENCES..." />
          </div>

          <button type="submit" className="w-full py-6 bg-red-600 text-white rounded-4xl font-black uppercase text-xs italic shadow-3xl hover:bg-white hover:text-red-600 transition-all border-none flex items-center justify-center gap-3 cursor-pointer">
            <Save size={20}/> VALIDER LE SCELLAGE SSE
          </button>
        </form>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-4xl flex items-center justify-between shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black/40 rounded-xl text-white shadow-inner">{icon}</div>
        <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest">{label}</span>
      </div>
      <span className={cn("text-2xl font-black italic m-0 tracking-tighter", color)}>{value}</span>
    </div>
  );
}