/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 MODULE : NOUVELLE RÉCLAMATION (ISO 10002)
 * -------------------------------------------------------------------------
 * RÔLE : Interface de capture et de qualification initiale des plaintes.
 * DESIGN : Elite High-Density, ClickUp Form, 100dvh.
 * -------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 11:20 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, Link2, Loader2, Save, 
  ShieldAlert, RefreshCw 
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function NouvelleReclamationPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    REC_Object: "",
    REC_Description: "",
    REC_Source: "MAIL",
    REC_DateReceipt: new Date().toISOString().split("T")[0],
    REC_Deadline: "",
    REC_Gravity: "MEDIUM",
    REC_TierId: "",
    REC_ProcessusId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setFetching(true);
      const [resTiers, resProc] = await Promise.all([
        apiClient.get("/tiers"),
        apiClient.get("/processus"),
      ]);
      setTiers(resTiers.data?.data || resTiers.data || []);
      setProcessus(resProc.data?.data || resProc.data || []);
    } catch { toast.error("ÉCHEC DE SYNCHRONISATION SMI"); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.REC_TierId) return toast.error("L'IDENTIFICATION DU TIERS EST OBLIGATOIRE (§8.2)");
    
    setLoading(true);
    const tid = toast.loading("SCELLAGE DOCUMENTAIRE...");
    try {
      await apiClient.post("/reclamations", {
        ...form,
        REC_Object: form.REC_Object.toUpperCase().trim(),
        REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null,
      });
      toast.success("PLAINTE ENREGISTRÉE ET MISE SOUS SURVEILLANCE", { id: tid });
      router.push("/dashboard/quality/reclamations");
    } catch { toast.error("ERREUR DE SCELLAGE", { id: tid }); }
    finally { setLoading(false); }
  };

  if (fetching) return <LoadingScreen label="Scanning Infrastructure..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <div className="text-left space-y-2">
            <h1 className="text-3xl lg:text-4xl tracking-tighter m-0 italic leading-none">Nouvelle <span className="text-blue-600">Plainte</span></h1>
            <p className="text-slate-700 text-[10px] tracking-widest font-black uppercase italic m-0">ENTRÉE SMI • ÉCOUTE ACTIVE (§8.2)</p>
          </div>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-8 py-4 rounded-4xl flex items-center gap-4 shrink-0 shadow-inner">
          <ShieldAlert className="text-blue-500" size={20} />
          <span className="text-[10px] text-blue-400 tracking-widest font-black uppercase italic">Canal Certifié Matrix</span>
        </div>
      </header>

      {/* 📟 WORKSPACE (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-32">
          
          <div className="bg-[#151B2B] p-12 rounded-[4rem] border-2 border-white/5 shadow-4xl text-left space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-700 tracking-widest ml-6 font-black italic">Objet de la Réclamation *</label>
                  <input required value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value})} placeholder="EX: ANOMALIE DE LIVRAISON LOT #902" className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-base font-black italic uppercase text-white outline-none focus:border-blue-600 transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-700 tracking-widest ml-6 font-black italic">Canal de Réception</label>
                  <select value={form.REC_Source} onChange={e => setForm({...form, REC_Source: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black italic uppercase text-blue-400 outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
                    <option value="MAIL">Transmission par E-mail</option>
                    <option value="TELEPHONE">Appel Téléphonique</option>
                    <option value="VISITE_CHANTIER">Audit Terrain</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-700 tracking-widest ml-6 font-black italic">Tiers Émetteur *</label>
                  <select required value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black italic uppercase text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
                    <option value="">-- SÉLECTIONNER L&apos;ÉMETTEUR --</option>
                    {tiers.map((t) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-700 tracking-widest ml-6 font-black italic">Gravité Initiale</label>
                  <select value={form.REC_Gravity} onChange={e => setForm({...form, REC_Gravity: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black italic uppercase text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
                    <option value="MEDIUM">MOYENNE (Analyse métier)</option>
                    <option value="HIGH">ÉLEVÉE (Action Corrective ISO)</option>
                    <option value="CRITICAL">CRITIQUE (Alerte Direction)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Imputation SMI */}
            <div className="bg-blue-600/5 p-10 rounded-[3rem] border-2 border-blue-600/20 space-y-8 relative overflow-hidden">
              <Link2 className="absolute -right-12 -top-12 text-blue-600/5" size={200} />
              <h3 className="text-xl font-black italic m-0 flex items-center gap-4 tracking-tighter uppercase"><Link2 className="text-blue-500" size={24} /> Imputation au Processus Pilote</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-700 tracking-widest font-black italic">Processus Responsable</label>
                  <select value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-[10px] font-black italic uppercase text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
                    <option value="">AUTOMATIQUE (NC QUALITÉ GLOBALE)</option>
                    {processus.map((p) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-700 tracking-widest font-black italic">Échéance de Traitement</label>
                  <input type="date" value={form.REC_Deadline} onChange={e => setForm({...form, REC_Deadline: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-4xl p-6 text-sm font-black italic uppercase text-white outline-none focus:border-blue-600 shadow-inner" style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-slate-700 tracking-widest ml-6 font-black italic">Exposé Détaillé des Faits *</label>
              <textarea required rows={6} value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} placeholder="Détailler les circonstances temporelles et l'impact immédiat..." className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-10 text-sm font-black italic text-white outline-none focus:border-blue-600 transition-all shadow-inner resize-none uppercase" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-10 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.6em] italic flex items-center justify-center gap-6 border-none cursor-pointer shadow-4xl active:scale-95 transition-all disabled:opacity-30">
              {loading ? <Loader2 className="animate-spin" size={28}/> : <Save size={28}/>} Valider et Transmettre (§8.2.1)
            </button>
          </div>
        </form>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
