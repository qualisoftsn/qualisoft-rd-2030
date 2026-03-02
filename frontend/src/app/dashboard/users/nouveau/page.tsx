/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ➕ MODULE : src/app/(dashboard)/users/nouveau/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement et certification des habilitations agent.
 * PHILOSOPHIE : No-Scroll Absolu. One-Pager Strict.
 * SÉCURITÉ : Zéro NextAuth. Isolation Multi-Tenant.
 * DATE DE RÉVISION : 02 Mars 2026 | 16:15 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, Fingerprint, GitBranch, Layers, Loader2, 
  Lock, Mail, MapPin, Save, Shield, ShieldCheck, Target, UserPlus 
} from "lucide-react";
import { toast, Toaster } from "sonner";

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
    } catch (e) {
      toast.error("Échec du chargement des matrices de structure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredUnits = useMemo(() => 
    referentials.orgUnits.filter((u: any) => u.OU_SiteId === form.U_SiteId), 
    [form.U_SiteId, referentials.orgUnits]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.U_Role === "PILOTE" && !form.U_AssignedProcessId) return toast.warning("PILOTAGE : Un Cockpit Processus est obligatoire (§5.3).");
    
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
      toast.success("AGENT HABILITÉ AVEC SUCCÈS", { id: tid });
      setTimeout(() => router.push("/dashboard/users"), 1000);
    } catch (err: any) {
      toast.error("ERREUR : Conflit d'indexation ou Kernel rejetant le payload.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-blue-500 italic">
      <Loader2 className="animate-spin" size={60} />
      <span className="text-[10px] uppercase tracking-[0.5em] animate-pulse">Initialisation des Matrices...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] text-white p-4 lg:p-10 italic flex flex-col overflow-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3 lg:p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"><ArrowLeft size={20} /></button>
          <div className="text-left">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter m-0 leading-none italic">Habilitation <span className="text-blue-500">Agent</span></h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 mt-2">Qualification RH §7.2</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shrink-0">
          <ShieldCheck className="text-emerald-500 animate-pulse" size={24} />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SDE Matrix Security</span>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[3rem] lg:rounded-[4rem] relative shadow-4xl overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
              <section className="space-y-10">
                <h3 className="text-[11px] font-black uppercase italic text-blue-500 flex items-center gap-3 border-b border-white/5 pb-4 tracking-widest"><UserPlus size={18} /> 01. Identité & Accès</h3>
                <div className="grid grid-cols-2 gap-6">
                   <Field label="Prénom *" value={form.U_FirstName} onChange={(v: any) => setForm({...form, U_FirstName: v})} />
                   <Field label="Nom *" value={form.U_LastName} onChange={(v: any) => setForm({...form, U_LastName: v})} />
                </div>
                <Field label="Email Professionnel *" value={form.U_Email} onChange={(v: any) => setForm({...form, U_Email: v})} type="email" />
                <div className="bg-blue-500/5 border border-blue-500/10 p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] relative overflow-hidden group">
                   <Lock className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-125 transition-transform" size={120} />
                   <p className="text-[9px] font-black uppercase text-blue-500 tracking-widest m-0 leading-none">Clé Initiale</p>
                   <span className="text-2xl lg:text-3xl font-black text-white block mt-3 tracking-widest font-mono">{form.U_Password}</span>
                   <p className="text-[8px] text-slate-500 italic mt-3 m-0 leading-relaxed uppercase">Rénitialisation obligatoire dès la première connexion.</p>
                </div>
              </section>

              <section className="space-y-10">
                <h3 className="text-[11px] font-black uppercase italic text-emerald-500 flex items-center gap-3 border-b border-white/5 pb-4 tracking-widest"><GitBranch size={18} /> 02. Structure & Autorité</h3>
                <div className="space-y-8">
                  <Select label="Rôle & Privilèges" value={form.U_Role} onChange={(v: any) => setForm({...form, U_Role: v})}>
                    <option value="USER">AGENT STANDARD</option>
                    <option value="PILOTE">PILOTE PROCESSUS (PROPRIÉTAIRE)</option>
                    <option value="ADMIN">ADMINISTRATEUR SMI</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-6">
                    <Select label="Site de Rattachement" value={form.U_SiteId} onChange={(v: any) => setForm({...form, U_SiteId: v})}>
                       <option value="">CHOISIR SITE...</option>
                       {referentials.sites.map((s: any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                    </Select>
                    <Select label="Unité Org." value={form.U_OrgUnitId} onChange={(v: any) => setForm({...form, U_OrgUnitId: v})} disabled={!form.U_SiteId}>
                       <option value="">CHOISIR UNITÉ...</option>
                       {filteredUnits.map((u: any) => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                    </Select>
                  </div>
                  <div className={`transition-all duration-500 ${form.U_Role === "PILOTE" ? "opacity-100" : "opacity-20 pointer-events-none grayscale"}`}>
                    <Select label="Cockpit Processus (§5.3)" value={form.U_AssignedProcessId} onChange={(v: any) => setForm({...form, U_AssignedProcessId: v})}>
                       <option value="">AFFECTATION DIRECTE...</option>
                       {referentials.processes.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </Select>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <footer className="shrink-0 p-8 lg:p-10 border-t border-white/5 bg-black/20 flex flex-col items-center gap-6">
             <button disabled={submitting} type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-white hover:text-blue-600 px-16 lg:px-24 py-4 lg:py-5 rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-xs italic tracking-widest shadow-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-4 active:scale-95 group">
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />} VALIDER L&apos;HABILITATION
             </button>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] m-0 italic flex items-center gap-3"><Target size={12} className="text-blue-500"/> Traçabilité des Habilitations Active (§7.2)</p>
          </footer>
        </form>
      </main>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 10px; }`}</style>
    </div>
  );
}

// --- ATOMIC FORM COMPONENTS ---
function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2.5 text-left group">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic group-focus-within:text-blue-500 transition-colors m-0 leading-none">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-6 text-xs font-black text-white italic outline-none focus:border-blue-600 focus:bg-white/10 transition-all shadow-inner m-0 placeholder:opacity-10" placeholder="..." />
    </div>
  );
}

function Select({ label, value, onChange, children, disabled = false }: any) {
  return (
    <div className={`space-y-2.5 text-left group ${disabled && "opacity-30 grayscale pointer-events-none"}`}>
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic group-focus-within:text-blue-500 m-0 leading-none transition-colors">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-6 text-[11px] font-black text-white italic outline-none focus:border-blue-600 focus:bg-white/10 cursor-pointer appearance-none transition-all shadow-inner m-0">
        {children}
      </select>
    </div>
  );
}