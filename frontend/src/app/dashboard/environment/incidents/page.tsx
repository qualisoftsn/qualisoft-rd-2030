/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : REGISTRE DES INCIDENTS SSE §8.2 (elite-sde)
 * FIX : Définition locale de LoadingScreen et KPITile pour éviter l'erreur 'never'/'undefined'.
 * DATE : 05 Mars 2026 | 14:15 GMT
 */
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, Plus, Activity, Flame, DollarSign, 
  ShieldCheck, Trash2, MapPin, Microscope, RefreshCcw 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import IncidentForm from './IncidentForm';

// --- COMPOSANT DE CHARGEMENT SDE ---
const LoadingScreen = ({ label }: { label: string }) => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
    <RefreshCcw className="animate-spin text-rose-600" size={60} />
    <span className="text-[10px] font-black uppercase tracking-[1em] text-rose-600 animate-pulse italic text-center px-10">
      {label}
    </span>
  </div>
);

export default function EnvironmentIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      toast.error("RUPTURE SYNCHRO REGISTRE SSE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.SSE_AvecArret).length;
    const totalDays = incidents.reduce((acc, i) => acc + (Number(i.SSE_NbJoursArret) || 0), 0);
    const cnq = totalDays * 85000; 
    return { total, critical, cnq: cnq.toLocaleString(), severity: total > 0 ? Math.round((critical/total)*100) : 0 };
  }, [incidents]);

  if (loading) return <LoadingScreen label="Syncing SSE Matrix §8.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter m-0 leading-none">Registre <span className="text-rose-600">Incidents</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic">Protocole de Crise §8.2 • ISO 14001</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-rose-600 px-10 py-5 rounded-3xl text-[11px] shadow-3xl flex items-center gap-4 hover:bg-white hover:text-rose-600 transition-all border-none cursor-pointer">
          <Plus size={20} strokeWidth={3} /> Déclarer Écart
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPITile label="Incidents" val={stats.total} icon={Activity} color="rose" />
          <KPITile label="Sévérité" val={`${stats.severity}%`} icon={Flame} color="amber" />
          <KPITile label="CNQ Estime" val={`${stats.cnq} XOF`} icon={DollarSign} color="emerald" />
          <KPITile label="SMI Status" val="VIGILANCE" icon={ShieldCheck} color="blue" />
        </div>

        {/* Table Register - Occupation Intégrale */}
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-[9px] text-slate-500 tracking-[0.2em] border-b border-white/5 font-black italic">
                  <th className="px-8 py-5 text-left">Méta-Données</th>
                  <th className="px-8 py-5 text-center">Typologie</th>
                  <th className="px-8 py-5 text-left">Exposé des Faits</th>
                  <th className="px-8 py-5 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.map(i => (
                  <tr key={i.SSE_Id} className="hover:bg-rose-600/5 transition-all group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black m-0 leading-none">{new Date(i.SSE_DateEvent).toLocaleDateString()}</p>
                      <span className="flex items-center gap-2 text-[8px] text-rose-500 mt-2 italic uppercase font-black"><MapPin size={10}/> {i.SSE_Lieu}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${i.SSE_AvecArret ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{i.SSE_Type}</span>
                    </td>
                    <td className="px-8 py-6 max-w-md"><p className="text-[10px] text-slate-400 italic leading-relaxed m-0 font-medium uppercase line-clamp-2">{i.SSE_Description}</p></td>
                    <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={async () => { if(confirm('SCELLAGE : SUPPRIMER ?')) { await apiClient.delete(`/sse-events/${i.SSE_Id}`); fetchData(); } }} className="p-3 bg-rose-600/10 text-rose-500 rounded-xl border-none cursor-pointer"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && <IncidentForm sites={sites} users={users} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244,63,94,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

function KPITile({ label, val, icon: Icon, color }: any) {
  const themes: any = { rose: "text-rose-500 border-rose-500/20", amber: "text-amber-500 border-amber-500/20", emerald: "text-emerald-500 border-emerald-500/20", blue: "text-blue-500 border-blue-500/20" };
  return (
    <div className={`p-6 bg-white/5 border rounded-4xl flex items-center justify-between shadow-xl ${themes[color]}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black/40 rounded-xl"><Icon size={18}/></div>
        <span className="text-[9px] font-black tracking-widest text-slate-500">{label}</span>
      </div>
      <span className="text-2xl font-black italic m-0 tracking-tighter text-white">{val}</span>
    </div>
  );
}