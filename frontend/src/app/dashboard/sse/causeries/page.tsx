/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Mic2, Plus, ShieldCheck, Calendar, Leaf, Shield, 
  Loader2, Clock, Users, QrCode, Trash2, X, Save, 
  Fingerprint, MapPin, User, Activity 
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- 🛠️ UTILITAIRE SDE SCELLÉ ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// ==========================================
// 1️⃣ COMPOSANT : FORMULAIRE DE QUALIFICATION (CauserieForm)
// ==========================================
function CauserieForm({ onClose, onSuccess, sites, users }: any) {
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
    <div className="fixed inset-0 z-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-[#151A2D] w-full max-w-xl rounded-[3rem] border border-white/10 p-8 shadow-4xl animate-in zoom-in-95 italic font-black uppercase">
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 className="text-xl tracking-tighter text-white m-0 flex items-center gap-3">
            <Plus size={20} className="text-blue-500"/> Nouvelle <span className="text-blue-500">Causerie</span>
          </h3>
          <X size={20} className="cursor-pointer text-slate-500 hover:text-white" onClick={onClose} />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 ml-2 tracking-widest">Thématique de Sensibilisation *</label>
            <input required value={form.CS_Theme} onChange={e => setForm({...form, CS_Theme: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-blue-600 italic uppercase" placeholder="NOM DU THÈME..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><Calendar size={12}/> Date & Heure</label>
              <input type="datetime-local" required value={form.CS_Date} onChange={e => setForm({...form, CS_Date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-blue-600" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><MapPin size={12}/> Lieu de Session</label>
              <input required value={form.CS_Lieu} onChange={e => setForm({...form, CS_Lieu: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-blue-600 italic uppercase" placeholder="ZONE / ATELIER..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><User size={12}/> Animateur §7.3</label>
              <select required value={form.CS_AnimateurId} onChange={e => setForm({...form, CS_AnimateurId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white italic outline-none focus:border-blue-600 cursor-pointer appearance-none">
                <option value="">CHOISIR AGENT...</option>
                {users.map((u:any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><ShieldCheck size={12}/> Site d&apos;attache</label>
              <select required value={form.CS_SiteId} onChange={e => setForm({...form, CS_SiteId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white italic outline-none focus:border-blue-600 cursor-pointer appearance-none">
                <option value="">SÉLECTIONNER SITE...</option>
                {sites.map((s:any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] italic shadow-lg hover:bg-white hover:text-blue-600 transition-all border-none flex items-center justify-center gap-3 cursor-pointer mt-4 active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Valider l&apos;Habilitation Session
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
  const [causeries, setCauseries] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeQR, setActiveQR] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, sRes, uRes, stRes] = await Promise.all([
        apiClient.get("/causeries"),
        apiClient.get("/sites"),
        apiClient.get("/users"),
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
    if (!confirm("⚠️ RÉVOCATION DÉFINITIVE DE LA SESSION ?")) return;
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("SESSION RÉVOQUÉE");
      fetchData();
    } catch { toast.error("ÉCHEC DE SUPPRESSION"); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 text-blue-600 font-black italic uppercase">
      <Loader2 className="animate-spin" size={40} />
      <span className="text-[10px] tracking-[0.5em] animate-pulse">Syncing Sensibilisation...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-lg">
            <Mic2 size={24} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 italic leading-none text-white">
              Causeries <span className="text-blue-600">SÉCURITÉ</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 mt-1">Management de la Sensibilisation ISO 45001 §7.3</p>
          </div>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic shadow-xl">
          <Plus size={16} strokeWidth={4} /> Programmer Session
        </button>
      </header>

      {/* 📊 KPI DASHBOARD (Shrink-0) */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <KPICard label="Total Sessions" value={stats?.total || 0} icon={<ShieldCheck size={18}/>} color="blue" />
        <KPICard label="Sessions / Mois" value={stats?.monthCount || 0} icon={<Calendar size={18}/>} color="emerald" />
        <KPICard label="Focus Écolo" value={`${stats?.envRatio || 0}%`} icon={<Leaf size={18}/>} color="green" />
        <KPICard label="Intégrité ISO" value="100%" icon={<Shield size={18}/>} color="purple" />
      </div>

      {/* 📋 REGISTRE ACTIF (Flex-1) */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {causeries.length === 0 ? (
          <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 italic">
            <Shield size={100} className="mb-6"/>
            <p className="text-xl font-black uppercase tracking-widest">Registre de Sensibilisation Vierge</p>
          </div>
        ) : (
          causeries.map((c) => (
            <div key={c.CS_Id} className={cn("bg-[#151A2D] border-2 p-6 rounded-[3rem] flex flex-col relative group transition-all", c.CS_IsActive ? "border-white/5 hover:border-blue-600/30" : "border-red-500/20 opacity-60")}>
              {!c.CS_IsActive && (
                <span className="absolute top-6 right-6 px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest italic">Clôturée</span>
              )}
              
              <div className="flex justify-between items-start mb-6 text-left">
                <div className="space-y-2">
                  <span className="text-[9px] text-blue-500 font-black tracking-widest flex items-center gap-2 uppercase italic leading-none">
                    <Clock size={12}/> {new Date(c.CS_Date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight m-0">{c.CS_Theme}</h3>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl text-slate-500 group-hover:text-blue-400 transition-colors shadow-inner">
                  <Users size={22}/>
                </div>
              </div>

              <div className="flex items-center gap-8 mb-6 pt-6 border-t border-white/5 text-left">
                 <Meta label="Animateur" value={c.CS_Animateur ? `${c.CS_Animateur.U_FirstName} ${c.CS_Animateur.U_LastName}` : "NON DÉFINI"} />
                 <Meta label="Présents" value={`${c._count?.CS_Participants || 0} Émargés`} highlight />
              </div>

              <div className="flex gap-3 mt-auto">
                <button onClick={() => toast.info("Génération du QR...")} disabled={!c.CS_IsActive} className="flex-1 py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-black italic text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 uppercase tracking-widest">
                  <QrCode size={16}/> Émargement Flash
                </button>
                <button onClick={() => handleDelete(c.CS_Id)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 transition-all cursor-pointer border-none shadow-xl"><Trash2 size={18}/></button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 🧾 MODALES SCELLÉES */}
      {isFormOpen && (
        <CauserieForm 
          sites={sites} 
          users={users} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
        />
      )}

      {/* 🧩 FOOTER TACTIQUE (Shrink-0) */}
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Fingerprint size={24} className="text-blue-600" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 mb-1 leading-none">SSE Sovereign Matrix</p>
            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none italic">Integrated Quality Registry • RD 2026</p>
          </div>
        </div>
        <Activity size={14} className="text-emerald-500 animate-pulse" />
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

// --- 🧩 SOUS-COMPOSANTS ---

function KPICard({ label, value, icon, color }: any) {
  const c: any = { 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    green: "text-green-500 bg-green-500/5 border-green-500/10", 
    purple: "text-purple-500 bg-purple-500/5 border-purple-500/10" 
  };
  return (
    <div className={cn("p-4 rounded-4xl border flex items-center justify-between shadow-xl backdrop-blur-md", c[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
        <span className="text-[8px] font-black uppercase text-slate-500 italic tracking-widest">{label}</span>
      </div>
      <span className="text-2xl font-black italic m-0 text-white leading-none tracking-tighter">{value}</span>
    </div>
  );
}

function Meta({ label, value, highlight }: any) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 italic leading-none">{label}</span>
      <span className={cn("text-[10px] font-black uppercase italic tracking-wider leading-none", highlight ? "text-blue-400" : "text-slate-300")}>{value}</span>
    </div>
  );
}