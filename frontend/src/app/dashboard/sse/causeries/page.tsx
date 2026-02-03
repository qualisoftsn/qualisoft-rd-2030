/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Mic2, Users, Calendar, Plus, ShieldCheck, Leaf, 
  Search, Trash2, FileText, QrCode, Shield,
  Loader2, X, ChevronRight, Save, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AttendanceQRModal from './AttendanceQRModal';

export default function CauseriesSSEPage() {
  const [causeries, setCauseries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ id: string, theme: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        apiClient.get('/causeries'),
        apiClient.get('/causeries/stats').catch(() => ({ data: { total: 0, monthCount: 0, envRatio: 0 } }))
      ]);
      setCauseries(cRes.data || []);
      setStats(sRes.data);
    } catch (e) { 
      toast.error("SYNCHRONISATION ÉCHOUÉE"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("VOULEZ-VOUS SUPPRIMER CETTE SESSION ?")) return;
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("SESSION SUPPRIMÉE");
      fetchData();
    } catch (e) { toast.error("ERREUR DE SUPPRESSION"); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em]">ACCÈS AU REGISTRE...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl tracking-tighter italic leading-none">CAUSERIES <span className="text-blue-500">SÉCURITÉ</span></h1>
          <p className="text-slate-500 text-[11px] tracking-[0.4em] mt-4 italic uppercase">ISO 45001 §7.3 • CULTURE PRÉVENTIVE</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-10 py-5 rounded-3xl text-[11px] shadow-2xl flex items-center gap-3 hover:bg-blue-500 transition-all active:scale-95 group">
          <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> PROGRAMMER SESSION
        </button>
      </header>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatsCard label="TOTAL SESSIONS" value={stats?.total || 0} icon={<ShieldCheck className="text-blue-400"/>} color="bg-blue-500/5" />
        <StatsCard label="SESSIONS / MOIS" value={stats?.monthCount || 0} icon={<Calendar className="text-emerald-400"/>} color="bg-emerald-500/5" />
        <StatsCard label="FOCUS ENVIRONNEMENT" value={`${stats?.envRatio || 0}%`} icon={<Leaf className="text-green-400"/>} color="bg-green-500/5" />
        <StatsCard label="INTÉGRITÉ ISO" value="100%" icon={<Shield className="text-purple-400"/>} color="bg-purple-500/5" />
      </div>

      {/* LISTE DES SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {causeries.map((c) => (
          <div key={c.CS_Id} className={`bg-slate-900/40 border ${c.CS_IsActive ? 'border-white/5' : 'border-red-500/20 opacity-50'} p-10 rounded-[4rem] relative group hover:border-blue-500/30 transition-all shadow-3xl backdrop-blur-xl`}>
             <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col">
                   <span className="text-[11px] text-blue-500 mb-2 font-black tracking-widest">{new Date(c.CS_Date).toLocaleDateString('fr-FR')}</span>
                   <h3 className="text-2xl tracking-tighter text-white uppercase italic">{c.CS_Theme}</h3>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 transition-all">
                  <Users size={24} className="text-slate-500 group-hover:text-blue-400"/>
                </div>
             </div>
             
             <div className="flex items-center gap-10 mb-10 border-t border-white/5 pt-8">
                <div className="flex flex-col">
                   <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">ANIMATEUR</span>
                   <span className="text-xs text-white">{c.CS_Animateur?.U_FirstName} {c.CS_Animateur?.U_LastName}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-10">
                   <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">ÉMARGEMENTS</span>
                   <span className="text-xs text-blue-400 uppercase font-black">{c._count?.CS_Participants || 0} PRÉSENTS</span>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setQrModalData({ id: c.CS_Id, theme: c.CS_Theme })} className="flex-1 py-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[10px] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3">
                  <QrCode size={18}/> ÉMARGEMENT FLASH
                </button>
                <button onClick={() => handleDelete(c.CS_Id)} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-red-500 transition-all">
                  <Trash2 size={20}/>
                </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && <CauserieForm onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />}
      {qrModalData && <AttendanceQRModal causerieId={qrModalData.id} theme={qrModalData.theme} onClose={() => setQrModalData(null)} />}
    </div>
  );
}

// --- FORMULAIRE COMPLET ---
function CauserieForm({ onClose, onRefresh }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ 
      CS_Theme: '', 
      CS_Date: new Date().toISOString().split('T')[0], 
      CS_CompteRendu: '', 
      CS_AnimateurId: '',
      CS_IsActive: true,
      participantIds: [] as string[] 
    });

    useEffect(() => {
      apiClient.get('/users').then(res => setUsers(res.data || []));
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!form.CS_AnimateurId || form.participantIds.length === 0) {
          return toast.error("ANIMATEUR ET PARTICIPANTS OBLIGATOIRES");
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/causeries', form);
            toast.success("CAUSERIE ENREGISTRÉE");
            onRefresh(); onClose();
        } catch (e: any) { toast.error("ERREUR DE LIAISON ANIMATEUR"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-500 flex items-center justify-center p-6 italic font-black uppercase">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] border border-white/10 p-16 space-y-8 shadow-4xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] scrollbar-hide">
                <div className="flex justify-between items-center border-b border-white/10 pb-8">
                  <h2 className="text-4xl tracking-tighter italic uppercase">SAISIE <span className="text-blue-500">SESSION</span></h2>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setForm({...form, CS_IsActive: !form.CS_IsActive})} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] ${form.CS_IsActive ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                      {form.CS_IsActive ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>} {form.CS_IsActive ? "ACTIVE" : "ARCHIVÉE"}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">THÈME SSE / ENVIRONNEMENT *</label>
                        <input required className="w-full bg-white/5 border border-white/10 p-7 rounded-3xl text-sm text-white outline-none focus:border-blue-500 transition-all uppercase italic font-black" value={form.CS_Theme} onChange={e => setForm({...form, CS_Theme: e.target.value.toUpperCase()})} placeholder="EX: TRI DES DÉCHETS" />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">DATE</label>
                            <input type="date" required className="w-full bg-white/5 border border-white/10 p-7 rounded-3xl text-sm text-white outline-none focus:border-blue-500 font-black italic" value={form.CS_Date} onChange={e => setForm({...form, CS_Date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">ANIMATEUR RÉFÉRENT *</label>
                            <select required className="w-full bg-white/5 border border-white/10 p-7 rounded-3xl text-sm text-white outline-none focus:border-blue-500 font-black italic uppercase" value={form.CS_AnimateurId} onChange={e => setForm({...form, CS_AnimateurId: e.target.value})}>
                                <option value="">CHOISIR L&apos;ANIMATEUR</option>
                                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">PARTICIPANTS CONVOQUÉS ({form.participantIds.length})</label>
                        <div className="grid grid-cols-3 gap-3 bg-white/5 p-8 rounded-[3rem] border border-white/10 max-h-60 overflow-y-auto scrollbar-hide">
                            {users.map(u => (
                              <label key={u.U_Id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${form.participantIds.includes(u.U_Id) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/20 border-white/5 text-slate-500'}`}>
                                <input type="checkbox" className="hidden" checked={form.participantIds.includes(u.U_Id)} onChange={() => {
                                    const ids = form.participantIds.includes(u.U_Id) ? form.participantIds.filter(id => id !== u.U_Id) : [...form.participantIds, u.U_Id];
                                    setForm({...form, participantIds: ids});
                                }} />
                                <span className="text-[9px] font-black uppercase">{u.U_FirstName} {u.U_LastName}</span>
                              </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase italic">COMPTE-RENDU §7.5</label>
                        <textarea className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] text-sm text-white outline-none h-40 focus:border-blue-500 resize-none font-black italic uppercase leading-relaxed" value={form.CS_CompteRendu} onChange={e => setForm({...form, CS_CompteRendu: e.target.value})} placeholder="RÉSUMÉ DES ÉCHANGES..." />
                    </div>
                </div>

                <div className="flex flex-col gap-6 pt-4">
                  <button type="submit" disabled={isSubmitting} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase shadow-3xl transition-all disabled:opacity-50 italic text-xs flex items-center justify-center gap-4">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20}/>} ENREGISTRER AU REGISTRE SMI
                  </button>
                  <button type="button" onClick={onClose} className="w-full text-[11px] text-slate-600 text-center hover:text-white transition-colors tracking-widest font-black uppercase italic">ANNULER</button>
                </div>
            </form>
        </div>
    );
}

function StatsCard({ label, value, icon, color }: any) {
  return (
    <div className={`${color} border border-white/5 p-8 rounded-[3rem] shadow-2xl group`}>
      <div className="p-4 bg-black/20 rounded-2xl w-fit mb-6 shadow-xl group-hover:bg-blue-500/10 transition-all">{icon}</div>
      <p className="text-[10px] text-slate-500 tracking-widest uppercase mb-2 font-black italic">{label}</p>
      <p className="text-4xl font-black italic tracking-tighter text-white">{value}</p>
    </div>
  );
}