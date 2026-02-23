/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎯 MODULE : TUNNEL DE QUALIFICATION & HABILITATION (§7.2)
 * DESIGN : One-Pager Form / Elite SDE Referential Strict
 */

"use client";

import apiClient from "@/core/api/api-client";
import { GitBranch, Layers, Loader2, MapPin, Save, ShieldCheck, UserPlus, ArrowLeft, Info, Fingerprint } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referentials, setReferentials] = useState({ sites: [], orgUnits: [], processes: [] });

  const [formData, setFormData] = useState({
    U_FirstName: "", U_LastName: "", U_Email: "", U_Password: "qs@20252026",
    U_Role: "USER", U_SiteId: "", U_OrgUnitId: "", U_AssignedProcessId: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, o, p] = await Promise.all([
        apiClient.get("/sites"), apiClient.get("/org-units"), apiClient.get("/processus")
      ]);
      setReferentials({
        sites: (s.data?.data || s.data).filter((x:any) => x.S_IsActive),
        orgUnits: (o.data?.data || o.data).filter((x:any) => x.OU_IsActive),
        processes: (p.data?.data || p.data).filter((x:any) => x.PR_IsActive),
      });
    } catch (e) { toast.error("ÉCHEC RÉFÉRENTIELS"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const filteredUnits = useMemo(() => 
    referentials.orgUnits.filter((u: any) => u.OU_SiteId === formData.U_SiteId)
  , [formData.U_SiteId, referentials.orgUnits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.U_Role === "PILOTE" && !formData.U_AssignedProcessId) return toast.warning("PILOTE SANS PROCESSUS (§5.3)");
    
    setSubmitting(true);
    const tid = toast.loading("Scellage de l'habilitation...");
    try {
      await apiClient.post("/users", { ...formData, U_Email: formData.U_Email.toLowerCase().trim(), U_IsActive: true });
      toast.success("AGENT QUALIFIÉ ET HABILITÉ", { id: tid });
      router.push("/dashboard/admin/users");
    } catch (err: any) { toast.error(err.response?.data?.message || "ERREUR CRITIQUE SDE", { id: tid }); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 text-blue-500 font-black italic">
      <Loader2 className="animate-spin" size={40} />
      <span className="text-[9px] uppercase tracking-[0.5em]">Initialisation des Matrices de Confiance...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-8 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 cursor-pointer"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter m-0 italic">Habilitation <span className="text-blue-500">Agent</span></h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0">Dossier de Compétence Personnel §7.2</p>
          </div>
        </div>
        <ShieldCheck className="text-emerald-500 animate-pulse" size={24}/>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#151A2D] border border-white/5 rounded-[2.5rem] p-8 relative">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10">
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase italic text-blue-500 flex items-center gap-2 border-b border-white/5 pb-2"><UserPlus size={14}/> Identité Civile</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom *" value={formData.U_FirstName} onChange={(v: any) => setFormData({...formData, U_FirstName: v})} />
                <Field label="Nom *" value={formData.U_LastName} onChange={(v: any) => setFormData({...formData, U_LastName: v})} />
              </div>
              <Field label="Email Professionnel *" value={formData.U_Email} onChange={(v: any) => setFormData({...formData, U_Email: v})} type="email" />
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                 <p className="text-[7px] font-black uppercase text-amber-500 italic mb-2">Clé d&apos;accès Master Provisoire</p>
                 <span className="text-[11px] font-mono font-black text-white">{formData.U_Password}</span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase italic text-emerald-500 flex items-center gap-2 border-b border-white/5 pb-2"><GitBranch size={14}/> Qualification SMI</h3>
              <div className="space-y-4">
                <Select label="Rôle & Autorité" value={formData.U_Role} onChange={(v: any) => setFormData({...formData, U_Role: v})}>
                  <option value="USER">COLLABORATEUR STANDARD</option>
                  <option value="PILOTE">PILOTE PROCESSUS</option>
                  <option value="COPILOTE">CO-PILOTE SDE</option>
                  <option value="ADMIN">ADMINISTRATEUR QUALITÉ</option>
                </Select>
                <Select label="Site de Rattachement" value={formData.U_SiteId} onChange={(v: any) => setFormData({...formData, U_SiteId: v})}>
                  <option value="">CHOISIR SITE...</option>
                  {referentials.sites.map((s:any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </Select>
                <Select label="Unité Organisationnelle" value={formData.U_OrgUnitId} onChange={(v: any) => setFormData({...formData, U_OrgUnitId: v})} disabled={!formData.U_SiteId}>
                  <option value="">CHOISIR UNITÉ...</option>
                  {filteredUnits.map((u:any) => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </Select>
                <Select label="Affectation Processus (§5.3)" value={formData.U_AssignedProcessId} onChange={(v: any) => setFormData({...formData, U_AssignedProcessId: v})} disabled={formData.U_Role !== 'PILOTE'}>
                  <option value="">AFFECTER COCKPIT...</option>
                  {referentials.processes.map((p:any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <button disabled={submitting} type="submit" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-12 py-3 rounded-xl font-black uppercase text-[10px] italic shadow-4xl flex items-center gap-3 cursor-pointer border-none transition-all active:scale-95">
              {submitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sceller l&apos;Habilitation Maître
            </button>
            <span className="text-[7px] font-black uppercase text-slate-600 flex items-center gap-2 italic tracking-widest"><Info size={10}/> Journal d&apos;audit actif • Traçabilité RH immuable</span>
          </div>
        </form>
      </main>

      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Fingerprint size={24} className="text-blue-600" />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] m-0 leading-none mb-1">Elite Sovereign Hub</p>
            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest m-0 italic">Integrated Personnel Qualification Engine</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_blue]" />
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>
      </footer>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}</style>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white italic outline-none focus:border-blue-600 transition-all uppercase placeholder:opacity-20" placeholder="..." />
    </div>
  );
}

function Select({ label, value, onChange, children, disabled = false }: any) {
  return (
    <div className={`space-y-1 text-left ${disabled ? 'opacity-20' : ''}`}>
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <select disabled={disabled} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white italic outline-none focus:border-blue-600 cursor-pointer appearance-none">{children}</select>
    </div>
  );
}