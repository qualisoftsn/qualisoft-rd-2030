/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ➕ MODULE : ENRÔLEMENT DES AGENTS (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Certification et enregistrement des habilitations.
 * PHILOSOPHIE : No-Scroll Absolu / High-Density / Matrix.
 * CONFORMITÉ : ISO 9001 §7.2 (Compétences).
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 23:40 GMT
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, GitBranch, Loader2, Lock, 
  Save, ShieldCheck, Target, UserPlus, RefreshCw 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referentials, setReferentials] = useState<any>({ sites: [], orgUnits: [], processes: [] });

  const [form, setForm] = useState({
    U_FirstName: "", U_LastName: "", U_Email: "", U_Password: "qs@20252026",
    U_Role: "USER", U_SiteId: "", U_OrgUnitId: "", U_AssignedProcessId: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, o, p] = await Promise.all([
        apiClient.get("/sites"),
        apiClient.get("/org-units"),
        apiClient.get("/processus"),
      ]);
      setReferentials({
        sites: (s.data?.data || s.data || []).filter((x: any) => x.S_IsActive),
        orgUnits: (o.data?.data || o.data || []).filter((x: any) => x.OU_IsActive),
        processes: (p.data?.data || p.data || []).filter((x: any) => x.PR_IsActive),
      });
    } catch { toast.error("Rupture de liaison avec les matrices structurelles."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredUnits = useMemo(() => 
    referentials.orgUnits.filter((u: any) => u.OU_SiteId === form.U_SiteId), 
    [form.U_SiteId, referentials.orgUnits]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.U_Role === "PILOTE" && !form.U_AssignedProcessId) {
      return toast.warning("CONFORMITÉ : Un Cockpit Processus est obligatoire (§5.3).");
    }
    
    setSubmitting(true);
    const tid = toast.loading("Scellage de l'habilitation...");
    try {
      const payload: any = {
        U_FirstName: form.U_FirstName.toUpperCase(),
        U_LastName: form.U_LastName.toUpperCase(),
        U_Email: form.U_Email.toLowerCase().trim(),
        U_Password: form.U_Password,
        U_Role: form.U_Role,
        U_IsActive: true,
      };
      if (form.U_SiteId) payload.U_SiteId = form.U_SiteId;
      if (form.U_OrgUnitId) payload.U_OrgUnitId = form.U_OrgUnitId;
      if (form.U_Role === 'PILOTE') payload.U_AssignedProcessId = form.U_AssignedProcessId;

      await apiClient.post("/users", payload);
      toast.success("AGENT HABILITÉ AU REGISTRE SDE.", { id: tid });
      setTimeout(() => router.push("/dashboard/users"), 1000);
    } catch { toast.error("ERREUR KERNEL : Payload rejeté ou conflit d'index.", { id: tid }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <ViewLoader label="Initialisation des Matrices §7.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex justify-between items-center mt-12 lg:mt-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"><ArrowLeft size={20} /></button>
          <div className="text-left">
            <h1 className="text-3xl lg:text-4xl tracking-tighter leading-none m-0 italic">Nouvelle <span className="text-blue-500">Habilitation</span></h1>
            <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 mt-2">Qualification RH §7.2 • Matrix Node</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <ShieldCheck className="text-emerald-500 animate-pulse" size={24} />
          <span className="text-[10px] text-emerald-500 tracking-widest">SDE SECURITY VERIFIED</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="h-full max-w-7xl mx-auto flex flex-col bg-[#151A2D] border border-white/5 rounded-[4rem] shadow-4xl overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-16">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
              
              <section className="space-y-12 text-left">
                <h3 className="text-[11px] text-blue-500 tracking-[0.4em] border-b border-white/5 pb-4 flex items-center gap-4 m-0"><UserPlus size={18} /> 01. Identité & Accès</h3>
                <div className="grid grid-cols-2 gap-8">
                   <Field label="Prénom *" val={form.U_FirstName} onChange={(v:any)=>setForm({...form, U_FirstName:v})} />
                   <Field label="Nom *" val={form.U_LastName} onChange={(v:any)=>setForm({...form, U_LastName:v})} />
                </div>
                <Field label="Email Professionnel *" val={form.U_Email} onChange={(v:any)=>setForm({...form, U_Email:v})} type="email" />
                <div className="bg-blue-600/5 border-2 border-blue-500/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                   <Lock className="absolute -right-6 -bottom-6 text-blue-500/10" size={150} />
                   <p className="text-[10px] text-blue-500 tracking-widest m-0">Clé d&apos;Accès Initiale</p>
                   <span className="text-3xl font-black text-white block mt-4 tracking-widest font-mono uppercase">{form.U_Password}</span>
                </div>
              </section>

              <section className="space-y-12 text-left">
                <h3 className="text-[11px] text-emerald-500 tracking-[0.4em] border-b border-white/5 pb-4 flex items-center gap-4 m-0"><GitBranch size={18} /> 02. Structure & Autorité</h3>
                <div className="space-y-8">
                  <Select label="Rôle & Privilèges" val={form.U_Role} onChange={(v:any)=>setForm({...form, U_Role:v})}>
                    <option value="USER">AGENT STANDARD</option>
                    <option value="PILOTE">PILOTE PROCESSUS (§5.3)</option>
                    <option value="ADMIN">ADMINISTRATEUR SMI</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-8">
                    <Select label="Site Master" val={form.U_SiteId} onChange={(v:any)=>setForm({...form, U_SiteId:v})}>
                       <option value="">CHOISIR SITE...</option>
                       {referentials.sites.map((s:any)=><option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                    </Select>
                    <Select label="Unité Org." val={form.U_OrgUnitId} onChange={(v:any)=>setForm({...form, U_OrgUnitId:v})} disabled={!form.U_SiteId}>
                       <option value="">CHOISIR UNITÉ...</option>
                       {filteredUnits.map((u:any)=><option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                    </Select>
                  </div>
                  <div className={cn("transition-all duration-500", form.U_Role !== "PILOTE" && "opacity-20 grayscale pointer-events-none")}>
                    <Select label="Cockpit Processus AFFECTÉ" val={form.U_AssignedProcessId} onChange={(v:any)=>setForm({...form, U_AssignedProcessId:v})}>
                       <option value="">AFFECTATION DIRECTE...</option>
                       {referentials.processes.map((p:any)=><option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </Select>
                  </div>
                </div>
              </section>

            </div>
          </div>

          <footer className="shrink-0 p-10 bg-black/40 border-t border-white/5 flex flex-col items-center gap-6">
            <button disabled={submitting} type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-20 py-6 rounded-[2.5rem] font-black italic text-xs tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-4xl border-none cursor-pointer flex items-center justify-center gap-4">
               {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> VALIDER L&apos;HABILITATION</>}
            </button>
            <p className="text-[9px] text-slate-500 tracking-[0.4em] m-0 flex items-center gap-3"><Target size={14} className="text-blue-500"/> Traçabilité Active §7.2</p>
          </footer>
        </form>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- HELPERS ATOMIQUES ---
function Field({ label, val, onChange, type = "text" }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <input type={type} required value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-600 transition-all uppercase" />
    </div>
  );
}

function Select({ label, val, onChange, children, disabled }: any) {
  return (
    <div className={cn("space-y-3", disabled && "opacity-30")}>
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black text-white italic outline-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}