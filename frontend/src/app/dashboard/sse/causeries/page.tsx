/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE ABSOLU : src/app/dashboard/sse/causerie/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Management des Causeries Sécurité (Sensibilisation SSE).
 * RÔLE : Suivi des sessions de sensibilisation, conformité ISO 45001 §7.3.
 * SÉCURITÉ : Zéro NextAuth. 100% apiClient. Responsive.
 * DATE DE RÉVISION : 02 Mars 2026 | 14:58 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Mic2, Plus, ShieldCheck, Calendar, Leaf, Shield, 
  Loader2, Clock, Users, QrCode, Trash2, X, Save, 
  Fingerprint, MapPin, User, Activity 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import AttendanceQRModal from "./AttendanceQRModal"; // Ajustez le chemin selon votre structure

// --- 🛠️ INTERFACES SDE SCELLÉES ---
interface Site { S_Id: string; S_Name: string; }
interface SdeUser { U_Id: string; U_FirstName: string; U_LastName: string; }
interface Causerie {
  CS_Id: string;
  CS_Theme: string;
  CS_Date: string;
  CS_IsActive: boolean;
  CS_Animateur?: SdeUser;
  _count?: { CS_Participants: number };
}

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// ==========================================
// 1️⃣ COMPOSANT : FORMULAIRE DE QUALIFICATION (CauserieForm)
// ==========================================
function CauserieForm({ onClose, onSuccess, sites, users }: { onClose: () => void, onSuccess: () => void, sites: Site[], users: SdeUser[] }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    CS_Theme: "",
    CS_Date: new Date().toISOString().slice(0, 16),
    CS_Lieu: "",
    CS_AnimateurId: "",
    CS_SiteId: "",
    CS_IsActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.CS_AnimateurId || !form.CS_SiteId) return toast.error("HABILITATION INCOMPLÈTE (§7.3)");
    
    setLoading(true);
    const tid = toast.loading("Scellage de la session...");
    try {
      await apiClient.post("/causeries", {
        ...form,
        CS_Date: new Date(form.CS_Date).toISOString(),
        CS_Theme: form.CS_Theme.toUpperCase(),
        CS_Lieu: form.CS_Lieu.toUpperCase()
      });
      toast.success("SESSION INDEXÉE AU REGISTRE", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE SCELLAGE SDE", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-600 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl transition-opacity" onClick={onClose} />
      <div className="relative bg-[#151A2D] w-full max-w-xl rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 p-6 lg:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 italic font-black uppercase my-auto">
        <header className="flex justify-between items-center mb-6 lg:mb-8 border-b border-white/5 pb-4">
          <h3 className="text-lg lg:text-xl tracking-tighter text-white m-0 flex items-center gap-3 leading-none">
            <Plus size={20} className="text-blue-500 shrink-0"/> Nouvelle <span className="text-blue-500">Causerie</span>
          </h3>
          <button onClick={onClose} className="p-2 bg-transparent border-none text-slate-500 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/5">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 ml-2 tracking-widest">Thématique de Sensibilisation *</label>
            <input required value={form.CS_Theme} onChange={e => setForm({...form, CS_Theme: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-[10px] lg:text-[11px] text-white outline-none focus:border-blue-600 italic uppercase shadow-inner transition-colors" placeholder="NOM DU THÈME..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><Calendar size={12}/> Date & Heure</label>
              <input type="datetime-local" required value={form.CS_Date} onChange={e => setForm({...form, CS_Date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-3.5 text-[10px] lg:text-[11px] text-white outline-none focus:border-blue-600 shadow-inner transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><MapPin size={12}/> Lieu de Session</label>
              <input required value={form.CS_Lieu} onChange={e => setForm({...form, CS_Lieu: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-[10px] lg:text-[11px] text-white outline-none focus:border-blue-600 italic uppercase shadow-inner transition-colors" placeholder="ZONE / ATELIER..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><User size={12}/> Animateur §7.3</label>
              <select required value={form.CS_AnimateurId} onChange={e => setForm({...form, CS_AnimateurId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-[10px] lg:text-[11px] text-white italic outline-none focus:border-blue-600 cursor-pointer appearance-none shadow-inner transition-colors">
                <option value="" className="bg-slate-900">CHOISIR AGENT...</option>
                {users.map((u) => <option key={u.U_Id} value={u.U_Id} className="bg-slate-900">{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><ShieldCheck size={12}/> Site d&apos;attache</label>
              <select required value={form.CS_SiteId} onChange={e => setForm({...form, CS_SiteId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-[10px] lg:text-[11px] text-white italic outline-none focus:border-blue-600 cursor-pointer appearance-none shadow-inner transition-colors">
                <option value="" className="bg-slate-900">SÉLECTIONNER SITE...</option>
                {sites.map((s) => <option key={s.S_Id} value={s.S_Id} className="bg-slate-900">{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 lg:py-5 bg-blue-600 text-white rounded-3xl lg:rounded-2xl font-black uppercase text-[10px] lg:text-[11px] italic shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:bg-white hover:text-blue-600 transition-all border-none flex items-center justify-center gap-3 cursor-pointer mt-6 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-4 h-4 lg:w-5 lg:h-5" /> : <Save size={18} className="lg:w-5 lg:h-5" />} 
            Valider l&apos;Habilitation Session
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2️⃣ COMPOSANT : PAGE PRINCIPALE (CauseriesSSEPage)
// ==========================================
export default function CauseriesSSEPage() {
  const [causeries, setCauseries] = useState<Causerie[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<SdeUser[]>([]);
  const [stats, setStats] = useState<{total: number, monthCount: number, envRatio: number} | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeQR, setActiveQR] = useState<{id: string, theme: string} | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, sRes, uRes, stRes] = await Promise.all([
        apiClient.get("/causeries"),
        apiClient.get("/sites").catch(() => ({ data: { data: [] } })),
        apiClient.get("/users").catch(() => ({ data: { data: [] } })),
        apiClient.get("/causeries/stats").catch(() => ({ data: { total: 0, monthCount: 0, envRatio: 0 } }))
      ]);
      setCauseries(cRes.data?.data || cRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setUsers(uRes.data?.data || uRes.data || []);
      setStats(stRes.data);
    } catch (e) {
      toast.error("Rupture de liaison avec le Noyau Matrix.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("⚠️ RÉVOCATION DÉFINITIVE DE LA SESSION ?")) return;
    const tid = toast.loading("Révocation en cours...");
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("SESSION RÉVOQUÉE", { id: tid });
      fetchData();
    } catch { toast.error("ÉCHEC DE SUPPRESSION", { id: tid }); }
  };

  if (loading && causeries.length === 0) return (
    <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 text-blue-600 font-black italic uppercase p-4">
      <Loader2 className="animate-spin w-10 h-10 lg:w-12 lg:h-12" strokeWidth={2} />
      <span className="text-[9px] lg:text-[10px] tracking-[0.4em] lg:tracking-[0.5em] animate-pulse text-center">Syncing Sensibilisation...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 sm:p-6 lg:p-8 lg:overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 lg:pb-8 mb-6 lg:mb-8 shrink-0 gap-5 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 lg:gap-6 text-left">
          <div className="p-3 lg:p-4 bg-blue-600/10 rounded-2xl lg:rounded-3xl border border-blue-500/20 shadow-lg shrink-0">
            <Mic2 size={28} className="text-blue-500 lg:w-8 lg:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter m-0 italic leading-none text-white">
              Causeries <span className="text-blue-600">SÉCURITÉ</span>
            </h1>
            <p className="text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] m-0 mt-2">Management Sensibilisation ISO 45001 §7.3</p>
          </div>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase flex items-center justify-center gap-2 lg:gap-3 border-none cursor-pointer transition-all italic shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95 text-white m-0">
          <Plus size={18} strokeWidth={3} className="shrink-0" /> Programmer Session
        </button>
      </header>

      

      {/* 📊 KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 shrink-0 animate-in slide-in-from-bottom-8 duration-700">
        <KPICard label="Total Sessions" value={stats?.total || 0} icon={<ShieldCheck size={18}/>} color="blue" />
        <KPICard label="Sessions / Mois" value={stats?.monthCount || 0} icon={<Calendar size={18}/>} color="emerald" />
        <KPICard label="Focus Écolo" value={`${stats?.envRatio || 0}%`} icon={<Leaf size={18}/>} color="green" />
        <KPICard label="Intégrité ISO" value="100%" icon={<Shield size={18}/>} color="purple" />
      </div>

      {/* 📋 REGISTRE ACTIF */}
      <main className="flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar lg:pr-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-6 animate-in slide-in-from-bottom-12 duration-1000">
        {causeries.length === 0 ? (
          <div className="col-span-full h-48 lg:h-full flex flex-col items-center justify-center opacity-30 italic py-10">
            <Shield size={64} className="mb-4 lg:mb-6 lg:w-20 lg:h-20" strokeWidth={1}/>
            <p className="text-sm lg:text-xl font-black uppercase tracking-widest text-center">Registre de Sensibilisation Vierge</p>
          </div>
        ) : (
          causeries.map((c) => (
            <div key={c.CS_Id} className={cn("bg-[#151A2D] border-2 p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col relative group transition-all shadow-xl hover:shadow-2xl", c.CS_IsActive ? "border-white/5 hover:border-blue-600/30" : "border-red-500/20 opacity-70 hover:opacity-100")}>
              {!c.CS_IsActive && (
                <span className="absolute top-6 right-6 lg:top-8 lg:right-8 px-2.5 py-1 bg-red-600/20 text-red-500 border border-red-500/20 rounded-md text-[7px] lg:text-[8px] font-black uppercase tracking-widest italic shadow-sm">Clôturée</span>
              )}
              
              <div className="flex justify-between items-start mb-6 lg:mb-8 text-left">
                <div className="space-y-2 lg:space-y-3 pr-2">
                  <span className="text-[8px] lg:text-[9px] text-blue-500 font-black tracking-widest flex items-center gap-1.5 uppercase italic leading-none">
                    <Clock size={12} className="shrink-0"/> {new Date(c.CS_Date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </span>
                  <h3 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter leading-tight m-0 line-clamp-2" title={c.CS_Theme}>{c.CS_Theme}</h3>
                </div>
                <div className="p-3 bg-white/5 rounded-xl lg:rounded-2xl text-slate-500 group-hover:text-blue-400 transition-colors shadow-inner shrink-0 mt-2">
                  <Users size={20} className="lg:w-6 lg:h-6" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6 lg:mb-8 pt-6 border-t border-white/5 text-left">
                 <Meta label="Animateur" value={c.CS_Animateur ? `${c.CS_Animateur.U_FirstName} ${c.CS_Animateur.U_LastName}` : "NON DÉFINI"} />
                 <Meta label="Présents" value={`${c._count?.CS_Participants || 0} Émargés`} highlight />
              </div>

              <div className="flex gap-3 mt-auto pt-2">
                <button 
                  onClick={() => setActiveQR({id: c.CS_Id, theme: c.CS_Theme})} 
                  disabled={!c.CS_IsActive} 
                  className="flex-1 py-3 lg:py-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl lg:rounded-xl text-[9px] lg:text-[10px] font-black italic text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 uppercase tracking-widest m-0 shadow-sm"
                >
                  <QrCode size={16} className="shrink-0" /> Émargement
                </button>
                <button 
                  onClick={() => handleDelete(c.CS_Id)} 
                  className="p-3 lg:p-4 bg-white/5 rounded-2xl lg:rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer border-none shadow-sm shrink-0 m-0"
                  title="Révoquer la session"
                >
                  <Trash2 size={18} className="lg:w-5 lg:h-5"/>
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 🧾 MODALES SCELLÉES */}
      {isFormOpen && (
        <CauserieForm sites={sites} users={users} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />
      )}
      {activeQR && (
        <AttendanceQRModal causerieId={activeQR.id} theme={activeQR.theme} onClose={() => setActiveQR(null)} />
      )}

      {/* 🧩 FOOTER TACTIQUE */}
      <footer className="mt-6 lg:mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center opacity-40 shrink-0 italic gap-4 pb-4 lg:pb-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <Fingerprint size={20} className="text-blue-600 lg:w-6 lg:h-6 shrink-0" />
          <div className="text-center sm:text-left">
            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] m-0 mb-1 leading-none">SSE Sovereign Matrix</p>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest m-0 leading-none italic">Integrated Quality Registry • RD 2026</p>
          </div>
        </div>
        <Activity size={14} className="text-emerald-500 animate-pulse hidden sm:block" />
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.5); }
      `}</style>
    </div>
  );
}

// --- 🧩 SOUS-COMPOSANTS ---

function KPICard({ label, value, icon, color }: {label: string, value: string|number, icon: any, color: string}) {
  const c: Record<string, string> = { 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    green: "text-green-500 bg-green-500/5 border-green-500/10", 
    purple: "text-purple-500 bg-purple-500/5 border-purple-500/10" 
  };
  return (
    <div className={cn("p-4 lg:p-5 rounded-2xl lg:rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg backdrop-blur-md gap-3", c[color])}>
      <div className="flex items-center gap-2 lg:gap-3 min-w-0">
        <div className="p-2 bg-black/40 rounded-lg lg:rounded-xl shrink-0">{icon}</div>
        <span className="text-[8px] lg:text-[9px] font-black uppercase text-slate-500 italic tracking-widest truncate">{label}</span>
      </div>
      <span className="text-xl lg:text-3xl font-black italic m-0 text-white leading-none tracking-tighter shrink-0">{value}</span>
    </div>
  );
}

function Meta({ label, value, highlight }: {label: string, value: string, highlight?: boolean}) {
  return (
    <div className="flex flex-col min-w-0 pr-2">
      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 lg:mb-1.5 italic leading-none truncate">{label}</span>
      <span className={cn("text-[9px] lg:text-[10px] font-black uppercase italic tracking-wider leading-none truncate", highlight ? "text-blue-400" : "text-slate-300")} title={value}>{value}</span>
    </div>
  );
}