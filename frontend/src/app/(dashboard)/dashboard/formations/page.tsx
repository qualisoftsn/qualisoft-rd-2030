/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎓 MODULE GPEC & COMPÉTENCES (§7.2 ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des habilitations, recyclages et capital humain.
 * FIX : Layout 100dvh, Zéro Scroll, Matrix Hybrid Modal.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 11:45 GMT
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Activity, BookOpen, GraduationCap, Plus, 
  Search, ShieldCheck, X, RefreshCcw} from "lucide-react";
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
      toast.error("ERREUR DE LIAISON GPEC MATRIX");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredFormations = useMemo(() => {
    const term = search.toLowerCase();
    return formations.filter(f => {
      const userName = `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase();
      return f.FOR_Title?.toLowerCase().includes(term) || userName.includes(term);
    });
  }, [formations, search]);

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "VALIDÉ": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "PLANIFIÉ": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "EXPIRÉ": return "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse";
      default: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  if (loading) return <LoadingScreen label="Scellage du Capital Humain §7.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER GPEC */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Plan <span className="text-blue-600">GPEC</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 flex items-center gap-2 italic">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §7.2 • Matrice des Compétences Matrix
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input placeholder="RECHERCHER AGENT OU TITRE..." className="bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-[10px] outline-none w-64 lg:w-96 text-white italic font-black focus:border-blue-600" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] flex items-center gap-3 transition-all border-none cursor-pointer text-white shadow-xl hover:bg-white hover:text-blue-600">
            <Plus size={18} strokeWidth={3} /> Planifier Session
          </button>
        </div>
      </header>

      {/* 📜 REGISTRE GPEC (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col min-h-full">
          <div className="p-10 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <div className="flex items-center gap-4 text-blue-500">
               <BookOpen size={24} />
               <h3 className="text-sm tracking-widest italic m-0 text-white uppercase font-black">Registre des Habilitations Matrix</h3>
            </div>
            <span className="text-[10px] text-slate-500">{filteredFormations.length} DOSSIERS ACTIFS INDEXÉS</span>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-black/40 text-[10px] text-slate-500 tracking-[0.3em] border-b border-white/5 font-black italic">
                  <th className="p-10">Collaborateur / ID</th>
                  <th className="p-10 text-center">Formation / Titre Délivré</th>
                  <th className="p-10 text-right">Statut GPEC §7.2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold italic">
                {filteredFormations.map((f) => (
                  <tr key={f.FOR_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="p-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner"><GraduationCap size={22} /></div>
                        <div>
                          <p className="text-sm font-black m-0 leading-none">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</p>
                          <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-widest">{f.FOR_User?.U_Email || 'Matricule Master'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-10 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[13px] text-white font-black uppercase tracking-tight">{f.FOR_Title}</span>
                        <span className="text-[9px] text-blue-500 italic uppercase opacity-60 tracking-[0.2em]">{f.FOR_Provider}</span>
                      </div>
                    </td>
                    <td className="p-10 text-right">
                      <span className={cn("px-6 py-2 rounded-xl text-[10px] font-black border uppercase italic", getStatusStyle(f.FOR_Status))}>
                        {f.FOR_Status || "EN ATTENTE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 💎 MODAL GPEC (Elite Matrix Design) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 italic font-black uppercase">
          <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const tid = toast.loading("Scellage du capital humain...");
              try {
                await apiClient.post("/formations", Object.fromEntries(formData.entries()));
                toast.success("HABILITATION INDEXÉE AVEC SUCCÈS", { id: tid });
                setIsModalOpen(false); fetchData();
              } catch { toast.error("ERREUR DE SCELLAGE GPEC", { id: tid }); }
            }}
            className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border-2 border-white/10 p-12 lg:p-16 space-y-12 shadow-4xl relative overflow-hidden text-left"
          >
            <header className="flex justify-between items-center border-b border-white/5 pb-8">
                <h2 className="text-3xl italic font-black uppercase leading-none tracking-tighter m-0 text-white">Planification <span className="text-blue-600">Session</span></h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer text-slate-500 hover:text-white transition-all"><X size={32}/></button>
            </header>
            
            <div className="space-y-10 font-black italic">
              <div className="space-y-3">
                <label className="text-[11px] text-slate-500 tracking-widest ml-4">INTITULÉ DE L&apos;HABILITATION *</label>
                <input required name="FOR_Title" placeholder="EX: HABILITATION ÉLECTRIQUE B2V..." className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-sm text-white focus:border-blue-600 outline-none uppercase italic" />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 tracking-widest ml-4">COLLABORATEUR (§7.2)</label>
                  <select required name="FOR_UserId" className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-2xl text-[12px] text-white outline-none cursor-pointer appearance-none">
                    <option value="">CHOISIR AGENT...</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 tracking-widest ml-4">DATE SESSION</label>
                  <input required name="FOR_Date" type="date" className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-2xl text-[12px] text-white focus:border-blue-600 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 tracking-widest ml-4">ORGANISME (§7.1.6)</label>
                  <select required name="FOR_Provider" className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-2xl text-[12px] text-white outline-none cursor-pointer appearance-none">
                    <option value="INTERNE">FORMATION INTERNE</option>
                    <option value="BUREAU VERITAS">BUREAU VERITAS</option>
                    <option value="APAVE">APAVE</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 tracking-widest ml-4">ÉCHÉANCE RECYCLAGE</label>
                  <input name="FOR_Expiry" type="date" className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-2xl text-[12px] text-white focus:border-blue-600 outline-none font-black" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[2.5rem] font-black text-xs tracking-[0.4em] text-white border-none shadow-3xl flex items-center justify-center gap-6 active:scale-95 italic uppercase transition-all hover:bg-white hover:text-blue-600 cursor-pointer">
              <RefreshCcw size={20} /> Indexer le capital humain
            </button>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { display: none !important; } * { scrollbar-width: none !important; }` }} />
    </div>
  );
}

// --- SHARED COMPONENTS ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <Activity className="animate-spin text-blue-500" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-blue-500 animate-pulse italic text-center px-10">{label}</span>
    </div>
  );
}