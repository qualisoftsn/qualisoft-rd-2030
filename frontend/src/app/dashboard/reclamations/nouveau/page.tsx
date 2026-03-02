/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 MODULE : DÉCLARATION DE RÉCLAMATION CLIENT (ISO 10002)
 * -------------------------------------------------------------------------
 * RÔLE : Interface de capture et de qualification initiale des plaintes.
 * LOGIQUE : Zéro NextAuth, responsive design, validation robuste.
 * DATE : 02 Mars 2026 | 14:15 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Info,
  Link2,
  Loader2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
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
    } catch (err) {
      toast.error("Échec de synchronisation des référentiels SMI");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage documentaire en cours...");

    if (!form.REC_TierId) {
      toast.error("L'identification du Tiers est obligatoire (§8.2).", { id: tid });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        REC_Object: form.REC_Object.toUpperCase().trim(),
        REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null,
      };

      await apiClient.post("/reclamations", payload);
      toast.success("Plainte enregistrée et mise sous surveillance.", { id: tid });
      router.push("/reclamations");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de scellage documentaire", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" strokeWidth={2} />
        <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic animate-pulse">
          Scanning Infrastructure...
        </span>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-4 sm:p-6 lg:p-12 text-white font-sans italic selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* 🛰️ BARRE TACTIQUE D'EN-TÊTE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-white/5 pb-6 lg:pb-10">
          <div className="flex items-center gap-5 lg:gap-8 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="p-4 lg:p-5 bg-white/5 rounded-xl lg:rounded-2xl hover:bg-white/10 transition-all border border-white/5 cursor-pointer text-slate-300 shadow-sm shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-tight m-0">
                Enregistrer une <span className="text-blue-600">Plainte</span>
              </h1>
              <p className="text-slate-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.5em] mt-2 m-0 italic">
                Entrée SMI • Écoute Active des Parties (§8.2)
              </p>
            </div>
          </div>
          <div className="p-3 lg:p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl lg:rounded-2xl flex items-center gap-3 shrink-0">
            <ShieldAlert className="text-blue-500" size={18} />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400">
              Canal Certifié
            </span>
          </div>
        </header>

        

        {/* 📟 FORMULAIRE DE QUALIFICATION */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 lg:space-y-10 bg-slate-900/40 p-6 sm:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* BLOC A : IDENTITÉ & SOURCE */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Objet de la réclamation (Libellé) *
                </label>
                <input
                  required
                  className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-sm lg:text-base font-black uppercase italic text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
                  value={form.REC_Object}
                  onChange={(e) => setForm({ ...form, REC_Object: e.target.value })}
                  placeholder="EX: RETARD DE LIVRAISON LOT #402"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Canal de réception
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-[10px] lg:text-[11px] font-black uppercase italic text-blue-400 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer shadow-inner pr-12"
                    value={form.REC_Source}
                    onChange={(e) => setForm({ ...form, REC_Source: e.target.value })}
                  >
                    <option value="MAIL">Transmission par E-mail</option>
                    <option value="TELEPHONE">Appel Téléphonique (Mémo)</option>
                    <option value="COURRIER">Courrier Postal / LRAR</option>
                    <option value="PV_RECEPTION">PV de Réception / Chantier</option>
                    <option value="VISITE_CHANTIER">Visite terrain / Audit</option>
                    <option value="RECLAMATION_ORALE">Signalement Oral (À documenter)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>
            </div>

            {/* BLOC B : TIERS & GRAVITÉ */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Organisme / Client Émetteur *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-[10px] lg:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-inner appearance-none pr-12"
                    value={form.REC_TierId}
                    onChange={(e) => setForm({ ...form, REC_TierId: e.target.value })}
                  >
                    <option value="">-- SÉLECTIONNER L&apos;ÉMETTEUR --</option>
                    {tiers.map((t) => (
                      <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Gravité estimée (Impact)
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-[10px] lg:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-inner appearance-none pr-12"
                    value={form.REC_Gravity}
                    onChange={(e) => setForm({ ...form, REC_Gravity: e.target.value })}
                  >
                    <option value="LOW" className="text-emerald-500">MINEURE (Signalement simple)</option>
                    <option value="MEDIUM" className="text-blue-500">MOYENNE (Analyse métier)</option>
                    <option value="HIGH" className="text-orange-500">ÉLEVÉE (Action Corrective ISO)</option>
                    <option value="CRITICAL" className="text-rose-500">CRITIQUE (Alerte Direction)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* 💎 SECTION : IMPUTATION SMI */}
          <div className="bg-blue-600/5 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border border-blue-500/20 space-y-8 shadow-inner relative overflow-hidden mt-8">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-500 rotate-12 pointer-events-none">
              <Link2 size={150} />
            </div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <Link2 className="text-blue-500 shrink-0" size={24} />
              <h3 className="text-lg lg:text-xl font-black uppercase italic tracking-tighter m-0">
                Imputation au Processus Pilote
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 text-left">
              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Processus Responsable
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-[10px] lg:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer pr-12"
                    value={form.REC_ProcessusId}
                    onChange={(e) => setForm({ ...form, REC_ProcessusId: e.target.value })}
                  >
                    <option value="">AUTOMATIQUE (NC QUALITÉ GLOBALE)</option>
                    {processus.map((p) => (
                      <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
                  Échéance impérative
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-2xl p-5 lg:p-6 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 transition-colors shadow-inner appearance-none"
                    value={form.REC_Deadline}
                    onChange={(e) => setForm({ ...form, REC_Deadline: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                  />
                  <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* ⚠️ ALERTE NC */}
            {!form.REC_ProcessusId && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 relative z-10 text-left">
                <AlertTriangle size={24} className="text-rose-500 shrink-0" />
                <p className="text-[10px] font-black text-rose-400 uppercase italic tracking-widest leading-relaxed m-0">
                  Attention : Sans imputation, le dossier génère automatiquement une <strong className="text-white">Non-Conformité (NC) globale</strong> pour analyse des causes racines (ISO 9001 §10.2).
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest m-0">
              Exposé détaillé des faits *
            </label>
            <textarea
              required
              rows={5}
              className="w-full bg-[#0B0F1A] border-2 border-white/5 rounded-4xl p-6 lg:p-8 text-xs lg:text-sm font-bold italic text-white outline-none focus:border-blue-500 transition-colors shadow-inner resize-none leading-relaxed"
              value={form.REC_Description}
              onChange={(e) => setForm({ ...form, REC_Description: e.target.value })}
              placeholder="Détailler les circonstances temporelles, les preuves fournies et l'impact immédiat..."
            />
          </div>

          {/* 🔘 BOUTONS D'ACTION */}
          <div className="flex flex-col gap-4 pt-8 lg:pt-10 border-t-2 border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-6 lg:py-8 rounded-4xl lg:rounded-[2.5rem] font-black uppercase italic text-[10px] lg:text-[11px] tracking-[0.3em] lg:tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] border-none cursor-pointer disabled:opacity-50 text-white"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Valider et Transmettre
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="p-4 text-slate-500 hover:text-white transition-colors font-black uppercase italic text-[9px] lg:text-[10px] tracking-widest border-none bg-transparent cursor-pointer"
            >
              Annuler et quitter
            </button>
          </div>
        </form>

        {/* ℹ️ BLOC CONSEIL ISO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-6 p-6 lg:p-8 bg-slate-900/50 border border-white/5 rounded-4xl lg:rounded-[3rem] shadow-xl">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 shadow-lg shrink-0">
            <Info size={24} />
          </div>
          <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold italic leading-relaxed uppercase tracking-widest text-left m-0">
            <span className="text-amber-500 font-black">RAPPEL NORMATIF (ISO 10002) :</span> Toute réclamation doit être traitée sans délai indu. L&apos;enregistrement doit être complet pour permettre une analyse objective. Si la plainte concerne la sécurité, augmentez la gravité à <span className="text-rose-400">CRITIQUE</span>.
          </p>
        </div>
      </div>
    </div>
  );
}