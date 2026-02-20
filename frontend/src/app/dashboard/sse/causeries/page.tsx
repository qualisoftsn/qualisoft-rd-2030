/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/sse/causeries/page.tsx
 * FONCTION : Management des sensibilisations et dialogues sécurité.
 * RÔLE : Digitalisation de la sensibilisation §7.3 ISO 45001.
 * INNOVATION : Émargement numérique certifié par QR Code (Elite Check-in).
 */

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

  /**
   * 📡 SYNCHRONISATION DU REGISTRE DES SESSIONS
   */
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
      toast.error("Échec de liaison avec le Noyau Causeries."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ RÉVOCATION DÉFINITIVE DE LA SESSION ? ACTION IRRÉVERSIBLE.")) return;
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("SESSION RÉVOQUÉE DU REGISTRE.");
      fetchData();
    } catch (e) { toast.error("ERREUR DE SUPPRESSION SERVEUR."); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-10">
      <Loader2 className="animate-spin text-blue-500" size={60} />
      <p className="text-blue-500 font-black uppercase italic text-[11px] tracking-[0.6em] animate-pulse">Accès au Référentiel Sensibilisation...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black selection:bg-blue-600/30 overflow-x-hidden">
      
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-12">
        <div className="text-left">
          <h1 className="text-5xl tracking-tighter italic leading-none">CAUSERIES <span className="text-blue-600">SÉCURITÉ</span></h1>
          <p className="text-slate-500 text-[12px] tracking-[0.5em] mt-5 italic uppercase">Management de la Sensibilisation ISO 45001 §7.3 • CULTURE SÉCURITÉ PRÉVENTIVE</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-12 py-6 rounded-3xl text-[12px] shadow-[0_25px_50px_rgba(37,99,235,0.3)] flex items-center gap-4 hover:bg-blue-500 transition-all active:scale-95 group border-none cursor-pointer">
          <Plus size={24} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> PROGRAMMER SESSION
        </button>
      </header>

      {/* DASHBOARD DES SESSIONS §SMI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <CStatsCard label="TOTAL SESSIONS" value={stats?.total || 0} icon={<ShieldCheck size={32} className="text-blue-400"/>} color="bg-blue-500/5 border-blue-500/10" />
        <CStatsCard label="SESSIONS / MOIS" value={stats?.monthCount || 0} icon={<Calendar size={32} className="text-emerald-400"/>} color="bg-emerald-500/5 border-emerald-500/10" />
        <CStatsCard label="FOCUS ÉCOLOGIQUE" value={`${stats?.envRatio || 0}%`} icon={<Leaf size={32} className="text-green-400"/>} color="bg-green-500/5 border-green-500/10" />
        <CStatsCard label="INTÉGRITÉ ISO" value="100%" icon={<Shield size={32} className="text-purple-400"/>} color="bg-purple-500/5 border-purple-500/10" />
      </div>

      {/* REGISTRE DES SESSIONS ACTIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
        {causeries.map((c) => (
          <div key={c.CS_Id} className={`bg-slate-900/40 border ${c.CS_IsActive ? 'border-white/5' : 'border-red-500/20 opacity-50'} p-12 rounded-[4.5rem] relative group hover:border-blue-600/30 transition-all shadow-4xl backdrop-blur-3xl`}>
             <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col">
                   <span className="text-[12px] text-blue-500 mb-4 font-black tracking-[0.3em]">{new Date(c.CS_Date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                   <h3 className="text-3xl tracking-tighter text-white uppercase italic leading-none">{c.CS_Theme}</h3>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl group-hover:bg-blue-600/20 transition-all shadow-inner border border-white/5">
                  <Users size={32} className="text-slate-500 group-hover:text-blue-400"/>
                </div>
             </div>
             
             <div className="flex items-center gap-12 mb-12 border-t border-white/5 pt-10">
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">ANIMATEUR RÉFÉRENT</span>
                   <span className="text-sm text-white italic tracking-tight uppercase">{c.CS_Animateur?.U_FirstName} {c.CS_Animateur?.U_LastName}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-12">
                   <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">CONTRÔLE ÉMARGEMENT</span>
                   <span className="text-sm text-blue-400 uppercase font-black italic tracking-tighter">{c._count?.CS_Participants || 0} PRÉSENTS IDENTIFIÉS</span>
                </div>
             </div>

             <div className="flex gap-5">
                <button onClick={() => setQrModalData({ id: c.CS_Id, theme: c.CS_Theme })} className="flex-2 py-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl text-[11px] font-black italic hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-4 border-none cursor-pointer tracking-widest shadow-2xl">
                  <QrCode size={22} strokeWidth={3}/> ÉMARGEMENT SÉCURISÉ FLASH
                </button>
                <button onClick={() => handleDelete(c.CS_Id)} className="flex-1 p-6 bg-white/5 border border-white/10 rounded-3xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-none cursor-pointer">
                  <Trash2 size={24}/>
                </button>
             </div>
          </div>
        ))}
        {causeries.length === 0 && (
          <div className="col-span-2 p-32 text-center text-slate-700 font-black italic uppercase tracking-[0.5em] opacity-30">
            Aucune session de sensibilisation au registre.
          </div>
        )}
      </div>

      {isModalOpen && <CauserieForm onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />}
      {qrModalData && <AttendanceQRModal causerieId={qrModalData.id} theme={qrModalData.theme} onClose={() => setQrModalData(null)} />}
    </div>
  );
}

function CStatsCard({ label, value, icon, color }: any) {
  return (
    <div className={`${color} p-10 rounded-[3.5rem] shadow-4xl group backdrop-blur-md transition-all hover:-translate-y-2`}>
      <div className="p-5 bg-black/20 rounded-2xl w-fit mb-8 shadow-xl group-hover:bg-blue-500/10 transition-all border border-white/5">{icon}</div>
      <p className="text-[11px] text-slate-500 tracking-[0.3em] uppercase mb-4 font-black italic leading-none">{label}</p>
      <p className="text-5xl font-black italic tracking-tighter text-white leading-none">{value}</p>
    </div>
  );
}

// ========================
// COMPOSANT : MODALE D'ÉMARGEMENT QR (`sse/causeries/AttendanceQRModal.tsx`)
// ========================

import { QRCodeSVG } from 'qrcode.react';

interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

function AttendanceQRModal({ causerieId, theme, onClose }: AttendanceQRModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      setToken(res.data.token);
    } catch (e) {
      toast.error("ERREUR DE GÉNÉRATION DU JETON SÉCURISÉ");
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => { generateToken(); }, [generateToken]);

  const attendanceUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/mobile/check-in?token=${token}`
    : '';

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-1000 flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-2xl rounded-[5rem] p-20 flex flex-col items-center text-center shadow-[0_0_150px_rgba(37,99,235,0.4)] animate-in zoom-in-95 duration-500 relative">
        <button onClick={onClose} className="absolute top-16 right-16 p-5 bg-slate-100 rounded-full text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border-none cursor-pointer shadow-inner"><X size={32} /></button>

        <div className="mb-12">
          <div className="bg-blue-600/10 p-8 rounded-[2.5rem] inline-block mb-10 shadow-inner">
            <ShieldCheck size={64} className="text-blue-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">ÉMARGEMENT <span className="text-blue-600">CERTIFIÉ</span></h2>
          <p className="text-[12px] text-slate-400 font-black uppercase mt-6 italic tracking-[0.2em] px-16 leading-relaxed">{theme}</p>
        </div>

        <div className="relative p-12 bg-slate-50 rounded-[4.5rem] border-[6px] border-blue-600 shadow-2xl flex flex-col items-center justify-center min-h-120 w-full max-w-md">
          {loading ? (
            <div className="flex flex-col items-center gap-8">
              <Loader2 className="animate-spin text-blue-600" size={80} />
              <span className="text-[12px] font-black text-blue-600 tracking-[0.8em] animate-pulse italic">SÉCURISATION...</span>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
              <QRCodeSVG value={attendanceUrl} size={280} level="H" includeMargin={false} />
            </div>
          )}
        </div>

        <div className="mt-16 space-y-10 w-full">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-900 italic leading-none">SMI QUALISOFT • CRYPTO-ÉMARGEMENT §7.3 • ISO 45001</p>
        </div>
      </div>
    </div>
  );
}