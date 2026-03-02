/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎓 MODULE GPEC & COMPÉTENCES (§7.2 ISO 9001)
 * Rôle : Pilotage des habilitations, recyclages et indexation du capital humain.
 * Fix : Nettoyage du scroll, normalisation des dates et z-index header.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:35 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Activity, AlertCircle, Award, BookOpen, GraduationCap, Loader2, Plus, Search, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fRes, uRes] = await Promise.all([
        apiClient.get("/formations"),
        apiClient.get("/users"),
      ]);
      setFormations(fRes.data?.data || fRes.data || []);
      setUsers(uRes.data?.data || uRes.data || []);
    } catch (err) {
      toast.error("ERREUR DE SYNCHRONISATION GPEC");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      const term = search.toLowerCase();
      const userName = `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase();
      return f.FOR_Title?.toLowerCase().includes(term) || userName.includes(term);
    });
  }, [formations, search]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "VALIDÉ": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "PLANIFIÉ": return "text-blue-500 bg-blue-500/10 border-blue-600/20";
      case "EXPIRÉ": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-[0.4em] animate-pulse">
      <Activity className="animate-spin mr-4" size={32} /> INITIALISATION GPEC...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col relative overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      <style jsx global>{`::-webkit-scrollbar { display: none !important; } * { scrollbar-width: none !important; }`}</style>

      <header className="p-8 lg:p-10 border-b border-white/5 flex flex-col xl:flex-row justify-between xl:items-center bg-[#0B0F1A]/80 backdrop-blur-3xl sticky top-0 z-50 shadow-2xl gap-8 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-4xl tracking-tighter italic font-black uppercase leading-none m-0">PLAN <span className="text-blue-600">GPEC</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] flex items-center gap-2 mt-4 italic font-black uppercase m-0 leading-none">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §7.2 • Maîtrise des Compétences
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input placeholder="RECHERCHER AGENT OU TITRE..." className="bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-[10px] outline-none focus:border-blue-600 w-64 lg:w-80 italic font-black text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-3xl transition-all border-none text-white font-black italic cursor-pointer active:scale-95">
            <Plus size={18} strokeWidth={3} /> Planifier Session
          </button>
        </div>
      </header>

      <main className="p-6 lg:p-12 flex-1">
        <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-10 border-b border-white/5 bg-white/2 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-blue-500">
              <BookOpen size={24} />
              <h3 className="text-sm tracking-[0.2em] italic uppercase font-black m-0 text-white">Registre des Habilitations Matrix</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-black tracking-widest">{filteredFormations.length} Dossiers Actifs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead className="text-[10px] text-slate-600 border-b border-white/5 uppercase italic font-black">
                <tr>
                  <th className="p-10">Collaborateur</th>
                  <th className="p-10 text-center">Formation / Titre Délivré</th>
                  <th className="p-10 text-right">Statut GPEC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFormations.map((f) => (
                  <tr key={f.FOR_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="p-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><GraduationCap size={18} /></div>
                        <span className="text-sm font-black tracking-tight">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</span>
                      </div>
                    </td>
                    <td className="p-10 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="italic uppercase text-white font-black text-[12px] m-0">{f.FOR_Title}</span>
                        <span className="text-[9px] text-slate-500 font-bold tracking-widest italic uppercase">{f.FOR_Provider}</span>
                      </div>
                    </td>
                    <td className="p-10 text-right">
                      <span className={cn("px-6 py-2 rounded-xl text-[10px] font-black border italic tracking-widest uppercase", getStatusColor(f.FOR_Status))}>
                        {f.FOR_Status || "EN ATTENTE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const tid = toast.loading("Scellage GPEC...");
              try {
                await apiClient.post("/formations", Object.fromEntries(formData.entries()));
                toast.success("CAPITAL HUMAIN INDEXÉ", { id: tid });
                setIsModalOpen(false); fetchData();
              } catch { toast.error("ERREUR DE SCELLAGE", { id: tid }); }
            }}
            className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-12 lg:p-16 space-y-10 shadow-4xl relative overflow-hidden italic text-left"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <h2 className="text-3xl italic font-black uppercase leading-none tracking-tighter m-0 text-white">Planification <span className="text-blue-600">Session</span></h2>
                <X size={24} className="cursor-pointer text-slate-500 hover:text-red-500" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="space-y-8 font-black italic">
              <div className="flex flex-col gap-3">
                <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">Intitulé Habilitation *</label>
                <input required name="FOR_Title" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-white focus:border-blue-600 outline-none uppercase font-black" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">Collaborateur *</label>
                  <select required name="FOR_UserId" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[12px] text-white outline-none font-black uppercase italic appearance-none cursor-pointer">
                    <option value="" className="bg-[#0F172A]">CHOISIR...</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">Date Session *</label>
                  <input required name="FOR_Date" type="date" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 font-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">Organisme *</label>
                  <select required name="FOR_Provider" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[12px] text-white outline-none uppercase font-black italic appearance-none cursor-pointer">
                    <option value="INTERNE">FORMATION INTERNE</option>
                    <option value="BUREAU VERITAS">BUREAU VERITAS</option>
                    <option value="APAVE">APAVE</option>
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">Recyclage</label>
                  <input name="FOR_Expiry" type="date" className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 font-black" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 py-8 rounded-3xl font-black text-xs tracking-widest text-white border-none flex items-center justify-center gap-4 cursor-pointer shadow-3xl uppercase italic active:scale-95">
              <Award size={20} /> Valider l&apos;Inscription GPEC
            </button>
          </form>
        </div>
      )}
    </div>
  );
}