/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Mic2, Users, Calendar, Plus, ShieldCheck, Leaf, 
  Search, Trash2, FileText, BarChart3, QrCode, Shield 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AttendanceQRModal from './AttendanceQRModal'; // ✅ Import validé

export default function CauseriesSSEPage() {
  const [causeries, setCauseries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ id: string, theme: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        apiClient.get('/causeries'),
        apiClient.get('/causeries/stats')
      ]);
      setCauseries(cRes.data || []);
      setStats(sRes.data);
    } catch (e) { 
      toast.error("Erreur de synchronisation SSE"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette session et ses émargements ?")) return;
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("Session supprimée");
      fetchData();
    } catch (e) {
      toast.error("Erreur de suppression");
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-widest">
        Ouverture du registre des causeries certifiées...
      </p>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl tracking-tighter italic">Causeries <span className="text-blue-500">SÉCURITÉ</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] mt-2 italic uppercase">
            Sensibilisation & Culture SSE • ISO 45001 §7.3
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] shadow-xl flex items-center gap-2 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
        >
          <Mic2 size={16} /> PROGRAMMER UNE SESSION
        </button>
      </header>

      {/* DASHBOARD SSE CONNECTÉ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Total Sessions" value={stats?.total || 0} icon={<ShieldCheck className="text-blue-400"/>} color="bg-blue-500/10" />
        <StatsCard label="Ce mois" value={stats?.monthCount || 0} icon={<Calendar className="text-emerald-400"/>} color="bg-emerald-500/10" />
        <StatsCard label="Focus Environnement" value={`${stats?.envRatio || 0}%`} icon={<Leaf className="text-green-400"/>} color="bg-green-500/10" />
        <StatsCard label="Intégrité Données" value="100%" icon={<Shield className="text-purple-400"/>} color="bg-purple-500/10" />
      </div>

      {/* LISTE DES SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {causeries.map((c) => (
          <div key={c.CS_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] relative group hover:border-blue-500/30 transition-all shadow-2xl hover:bg-slate-900/60">
             <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                   <span className="text-[10px] text-blue-500 mb-1 font-bold">
                     {new Date(c.CS_Date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                   </span>
                   <h3 className="text-xl tracking-tighter text-white uppercase italic">{c.CS_Theme}</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl shadow-inner group-hover:bg-blue-500/10 transition-colors">
                  <Users size={20} className="text-slate-500 group-hover:text-blue-400"/>
                </div>
             </div>
             
             <div className="flex items-center gap-6 mb-6">
                <div className="flex flex-col">
                   <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">ANIMATEUR RÉFÉRENT</span>
                   <span className="text-[10px] text-white">{c.CS_Animateur?.U_FirstName} {c.CS_Animateur?.U_LastName}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-6">
                   <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">ÉMARGEMENTS</span>
                   <span className="text-[10px] text-blue-400 uppercase tracking-tighter font-black">{c._count?.CS_Participants || 0} PRÉSENTS CERTIFIÉS</span>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => setQrModalData({ id: c.CS_Id, theme: c.CS_Theme })} 
                  className="flex-1 py-4 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <QrCode size={14}/> ÉMARGEMENT FLASH
                </button>
                <button className="flex-1 py-4 bg-white/5 rounded-xl text-[9px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <FileText size={14}/> COMPTE-RENDU
                </button>
                <button 
                  onClick={() => handleDelete(c.CS_Id)}
                  className="p-4 bg-white/5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={16}/>
                </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && <CauserieForm onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />}

      {qrModalData && (
        <AttendanceQRModal 
          causerieId={qrModalData.id}
          theme={qrModalData.theme}
          onClose={() => setQrModalData(null)}
        />
      )}
    </div>
  );
}

// --- COMPOSANTS INTERNES ---

function StatsCard({ label, value, icon, color }: any) {
  return (
    <div className={`${color} border border-white/5 p-6 rounded-[2.5rem] shadow-inner transition-transform hover:scale-105`}>
      <div className="p-3 bg-white/5 rounded-xl w-fit mb-4 shadow-sm">{icon}</div>
      <p className="text-[8px] text-slate-500 tracking-widest uppercase mb-1 font-black italic">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter text-white">{value}</p>
    </div>
  );
}

function CauserieForm({ onClose, onRefresh }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [form, setForm] = useState({ 
      CS_Theme: '', 
      CS_Date: new Date().toISOString().split('T')[0], 
      CS_CompteRendu: '', 
      participantIds: [] as string[] 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        apiClient.get('/users').then(res => setUsers(res.data || []));
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await apiClient.post('/causeries', form);
            toast.success("Causerie enregistrée au registre SMI");
            onRefresh(); 
            onClose();
        } catch (e) { 
            toast.error("Erreur lors de l'enregistrement de la session"); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-200 flex items-center justify-center p-6 italic font-black uppercase">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-16 space-y-8 shadow-4xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start">
                  <h2 className="text-4xl tracking-tighter text-white italic uppercase">Programmer <span className="text-blue-500">Session</span></h2>
                  <ShieldCheck className="text-blue-500/20" size={48} />
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 ml-4 tracking-widest uppercase font-black">Thème SSE / Environnement</label>
                        <input 
                          required 
                          className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white outline-none focus:border-blue-500 transition-colors uppercase italic font-black" 
                          value={form.CS_Theme} 
                          onChange={e => setForm({...form, CS_Theme: e.target.value.toUpperCase()})} 
                          placeholder="EX: GESTION DES DÉVERSEMENTS ACCIDENTELS..." 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 ml-4 tracking-widest uppercase font-black">Date de session</label>
                            <input 
                              type="date" 
                              className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white outline-none focus:border-blue-500 font-black italic" 
                              value={form.CS_Date} 
                              onChange={e => setForm({...form, CS_Date: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 ml-4 tracking-widest uppercase font-black">Participants convoqués</label>
                            <select 
                              multiple 
                              className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none h-40 focus:border-blue-500 scrollbar-hide font-black italic" 
                              onChange={e => {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                setForm({...form, participantIds: values});
                            }}>
                                {users.map(u => (
                                  <option key={u.U_Id} value={u.U_Id} className="p-2 border-b border-white/5 uppercase">
                                    {u.U_FirstName} {u.U_LastName}
                                  </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 ml-4 tracking-widest uppercase font-black italic">Points clés du compte-rendu</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] text-white outline-none h-32 focus:border-blue-500 resize-none font-black italic uppercase" 
                          value={form.CS_CompteRendu} 
                          onChange={e => setForm({...form, CS_CompteRendu: e.target.value})} 
                          placeholder="RÉSUMÉ DES ÉCHANGES ET ACTIONS DÉCIDÉES..."
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed italic"
                  >
                    {isSubmitting ? "INDEXATION EN COURS..." : "VALIDER & DIFFUSER AU SMI"}
                  </button>
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="w-full text-[10px] text-slate-500 text-center hover:text-white transition-colors tracking-widest font-black uppercase italic"
                  >
                    Annuler l&apos;opération
                  </button>
                </div>
            </form>
        </div>
    );
}